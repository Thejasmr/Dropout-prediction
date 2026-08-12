"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  CalendarCheck, 
  Award, 
  DollarSign, 
  FileDown, 
  RefreshCw,
  Clock,
  Check
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { useIngestion } from "@/hooks/useIngestion";

const ENTITIES = {
  student: {
    id: "student",
    title: "Student Profiles",
    description: "Core student demographic records, emails, batch years, and semesters.",
    requiredFields: [
      { key: "enrollment_no", label: "Enrollment Number" },
      { key: "full_name", label: "Student Full Name" }
    ],
    optionalFields: [
      { key: "email", label: "Email Address" },
      { key: "phone", label: "Phone Number" },
      { key: "guardian_phone", label: "Guardian Phone" },
      { key: "guardian_email", label: "Guardian Email" },
      { key: "batch_year", label: "Batch Year" },
      { key: "current_semester", label: "Current Semester" }
    ],
    csvTemplate: "enrollment_no,full_name,email,phone,guardian_phone,guardian_email,batch_year,current_semester\nEP2026001,John Doe,john.doe@example.com,9876543210,9876543211,guardian.doe@example.com,2026,1"
  },
  attendance: {
    id: "attendance",
    title: "Attendance Logs",
    description: "Daily or subject-specific student attendance statuses (present, absent, late).",
    requiredFields: [
      { key: "enrollment_no", label: "Enrollment Number" },
      { key: "date", label: "Attendance Date (YYYY-MM-DD)" },
      { key: "subject_id", label: "Subject UUID" },
      { key: "status", label: "Status (present/absent/late)" }
    ],
    optionalFields: [],
    csvTemplate: "enrollment_no,date,subject_id,status\nEP2026001,2026-08-04,4a3b2c1d-0000-0000-0000-000000000000,present"
  },
  assessment: {
    id: "assessment",
    title: "Assessment Scores",
    description: "Assessment test scores, quiz grades, exam marks, and maximum scoring weight.",
    requiredFields: [
      { key: "enrollment_no", label: "Enrollment Number" },
      { key: "subject_id", label: "Subject UUID" },
      { key: "assessment_type", label: "Assessment Type" },
      { key: "score", label: "Score Obtained" },
      { key: "max_score", label: "Maximum Score" }
    ],
    optionalFields: [
      { key: "attempt_number", label: "Attempt Number" },
      { key: "assessment_date", label: "Assessment Date (YYYY-MM-DD)" }
    ],
    csvTemplate: "enrollment_no,subject_id,assessment_type,score,max_score,attempt_number,assessment_date\nEP2026001,4a3b2c1d-0000-0000-0000-000000000000,Midterm,85.5,100.0,1,2026-08-04"
  },
  fee: {
    id: "fee",
    title: "Fee Status",
    description: "Tuition fee ledger records, amounts due, payment status, and due dates.",
    requiredFields: [
      { key: "enrollment_no", label: "Enrollment Number" },
      { key: "semester", label: "Semester Number" },
      { key: "amount_due", label: "Amount Due" },
      { key: "due_date", label: "Payment Due Date (YYYY-MM-DD)" },
      { key: "status", label: "Payment Status (paid/partial/overdue)" }
    ],
    optionalFields: [
      { key: "amount_paid", label: "Amount Paid" },
      { key: "paid_date", label: "Paid Date (YYYY-MM-DD)" }
    ],
    csvTemplate: "enrollment_no,semester,amount_due,amount_paid,due_date,paid_date,status\nEP2026001,1,15000.00,15000.00,2026-08-01,2026-08-01,paid"
  }
};

const iconMap = {
  student: Users,
  attendance: CalendarCheck,
  assessment: Award,
  fee: DollarSign
};

export default function IngestionPage() {
  const { uploadFile, history } = useIngestion();
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Fields, 3: Completed
  const [entityType, setEntityType] = useState("student");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [spreadsheetHeaders, setSpreadsheetHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [ingestionResult, setIngestionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processUploadedFile = (uploadedFile) => {
    setErrorMsg("");
    setFile(uploadedFile);

    if (uploadedFile.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const firstLine = text.split("\n")[0];
        const headers = firstLine.split(",")
          .map(h => h.trim().replace(/"/g, ""))
          .filter(h => h.length > 0);
        setSpreadsheetHeaders(headers);

        const initialMapping = {};
        const entity = ENTITIES[entityType];
        const allFields = [...entity.requiredFields, ...entity.optionalFields];

        allFields.forEach(field => {
          const match = headers.find(h =>
            h.toLowerCase() === field.key.toLowerCase() ||
            h.toLowerCase().replace(/_|\s/g, "") === field.key.toLowerCase().replace(/_|\s/g, "")
          );
          initialMapping[field.key] = match || "";
        });

        setFieldMapping(initialMapping);
        setStep(2);
      };
      reader.readAsText(uploadedFile);
    } else {
      // Fallback for Excel
      setSpreadsheetHeaders([]);
      const initialMapping = {};
      const entity = ENTITIES[entityType];
      const allFields = [...entity.requiredFields, ...entity.optionalFields];
      allFields.forEach(field => {
        initialMapping[field.key] = "";
      });
      setFieldMapping(initialMapping);
      setStep(2);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files?.[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const entity = ENTITIES[entityType];
    const blob = new Blob([entity.csvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${entity.id}_template.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleIngestSubmit = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const result = await uploadFile({ file, fieldMapping, entityType });
      setIngestionResult(result);
      setStep(3);
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || "";
      const isAuth =
        detail.toLowerCase().includes("invalid") ||
        detail.toLowerCase().includes("expired") ||
        detail.toLowerCase().includes("token") ||
        err?.response?.status === 401;

      if (isAuth) {
        setErrorMsg("Your session has expired. Please save your mapping and log in again — you will be redirected shortly.");
      } else {
        setErrorMsg(detail || "An error occurred during spreadsheet ingestion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSpreadsheetHeaders([]);
    setFieldMapping({});
    setIngestionResult(null);
    setErrorMsg("");
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Spreadsheet Data Ingestion</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload attendance rosters, academic test scores, or fee payment spreadsheets (.csv, .xlsx)
        </p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between max-w-xl mx-auto py-2">
        <div className={`flex items-center gap-2 text-xs font-bold transition-colors duration-300 ${step >= 1 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${step >= 1 ? "bg-blue-100 dark:bg-blue-955 text-blue-600 dark:text-blue-400 font-bold scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>1</span>
          <span>Upload File</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800" />
        <div className={`flex items-center gap-2 text-xs font-bold transition-colors duration-300 ${step >= 2 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${step >= 2 ? "bg-blue-100 dark:bg-blue-955 text-blue-600 dark:text-blue-400 font-bold scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>2</span>
          <span>Map Columns</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800" />
        <div className={`flex items-center gap-2 text-xs font-bold transition-colors duration-300 ${step >= 3 ? "text-emerald-600" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${step >= 3 ? "bg-emerald-100 dark:bg-emerald-955 text-emerald-600 font-bold scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>3</span>
          <span>Validation & Ingestion</span>
        </div>
      </div>

      {/* Stepper Content with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Step 1: Template Selection and Drag & Drop */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Entity Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(ENTITIES).map((entity) => {
                  const Icon = iconMap[entity.id];
                  const isSelected = entityType === entity.id;
                  return (
                    <div
                      key={entity.id}
                      onClick={() => setEntityType(entity.id)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-955/10 shadow-md scale-[1.02]"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40 hover:scale-[1.01]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-100 dark:bg-blue-955 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white text-[9px]">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{entity.title}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-normal line-clamp-3">{entity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upload Card and Download Template */}
              <Card className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div
                    onClick={handleDivClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileDrop}
                    className={`flex-1 border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer w-full ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/40 dark:border-blue-400 dark:bg-blue-955/20 scale-[0.99] shadow-inner"
                        : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 bg-slate-50/50 dark:bg-slate-900/50"
                    }`}
                  >
                    <UploadCloud className={`w-12 h-12 mx-auto mb-4 transition-transform duration-300 ${isDragging ? "scale-110 text-blue-500" : "text-blue-600 dark:text-blue-400"}`} />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Drag & Drop your CSV or Excel file here
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                      Supports .csv, .xlsx up to 50MB per upload batch
                    </p>
                    <Button size="sm" className="pointer-events-none">
                      Browse Files
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  <div className="w-full md:w-80 flex flex-col justify-center items-center md:items-start p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-850">
                    <FileSpreadsheet className="w-8 h-8 text-blue-500 mb-3" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Need a sample structure?
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 text-center md:text-left mt-1 mb-4">
                      Download the pre-formatted CSV template tailored exactly for {ENTITIES[entityType].title}.
                    </p>
                    <Button 
                      onClick={downloadTemplate} 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-1.5"
                    >
                      <FileDown className="w-4 h-4" /> Download Template
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: Column Field Mapper UI */}
          {step === 2 && (
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Column Field Mapper ({file?.name})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-0">
                <p className="text-xs text-slate-500">
                  Map headers from your uploaded file to the canonical database target fields for <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">{ENTITIES[entityType].title}</span>.
                </p>

                {errorMsg && (
                  <div className="p-3 text-xs bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ...ENTITIES[entityType].requiredFields.map(f => ({ ...f, required: true })),
                    ...ENTITIES[entityType].optionalFields.map(f => ({ ...f, required: false }))
                  ].map(field => (
                    <div key={field.key} className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Target DB: {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      <Select
                        value={fieldMapping[field.key] || ""}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, [field.key]: e.target.value })}
                        options={[
                          { value: "", label: "-- Map Spreadsheet Column --" },
                          ...spreadsheetHeaders.map(h => ({ value: h, label: `Header: ${h}` })),
                          ...(!spreadsheetHeaders.includes(field.key) ? [{ value: field.key, label: `Default: ${field.key}` }] : [])
                        ]}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>Cancel</Button>
                  <Button onClick={handleIngestSubmit} disabled={isLoading} className="gap-1.5">
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting...
                      </>
                    ) : (
                      <>
                        Run Validation & Ingest <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Completed */}
          {step === 3 && (
            <Card className="p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Data Successfully Ingested!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                File <span className="font-semibold text-slate-700 dark:text-slate-300">{file?.name}</span> was successfully parsed and matched.
              </p>

              <div className="grid grid-cols-2 max-w-sm mx-auto gap-4 py-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Rows</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{ingestionResult?.total_rows ?? 0}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Created Records</p>
                  <p className="text-lg font-bold text-emerald-600">{ingestionResult?.created ?? 0}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Updated Records</p>
                  <p className="text-lg font-bold text-blue-600">{ingestionResult?.updated ?? 0}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Skipped Records</p>
                  <p className="text-lg font-bold text-amber-600">{ingestionResult?.skipped ?? 0}</p>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={resetForm} size="sm">
                  Upload Another Batch
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Ingestion History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Spreadsheet Ingestion History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead>Records Parsed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history && history.length > 0 ? (
                history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs font-semibold">{row.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{row.filename}</TableCell>
                    <TableCell>{row.processed_records} Records</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "completed" ? "low" : "high"}>
                        {row.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {new Date(row.uploaded_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-xs text-slate-400 py-6">
                    No spreadsheet ingestion history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
