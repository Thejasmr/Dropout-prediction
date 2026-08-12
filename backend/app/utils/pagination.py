import base64
from typing import List, Tuple, Optional, Any, Callable


def encode_cursor(value: str) -> str:
    return base64.b64encode(value.encode("utf-8")).decode("utf-8")


def decode_cursor(cursor: str) -> Optional[str]:
    try:
        return base64.b64decode(cursor.encode("utf-8")).decode("utf-8")
    except Exception:
        return None


def apply_cursor_pagination(
    items: List[Any],
    limit: int,
    cursor_key_fn: Callable[[Any], str]
) -> Tuple[List[Any], Optional[str], bool]:
    """
    Given a list of items fetched with limit + 1, returns:
    (items_subset, next_cursor_string, has_more_boolean)
    """
    has_more = len(items) > limit
    result_items = items[:limit] if has_more else items
    next_cursor = None

    if has_more and result_items:
        last_item = result_items[-1]
        next_cursor = encode_cursor(cursor_key_fn(last_item))

    return result_items, next_cursor, has_more
