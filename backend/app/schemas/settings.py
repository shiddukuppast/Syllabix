from typing import Literal

from pydantic import BaseModel


class SettingsSchema(BaseModel):
    reading_font_size: Literal["normal", "large", "compact"] = "normal"
    default_mode: Literal["Syllabus + AI", "Strict Syllabus"] = "Syllabus + AI"
    answer_detail: Literal["concise", "balanced", "comprehensive"] = "balanced"
    exam_preparation_focus: bool = True
    study_reminders: bool = True
    high_contrast_code: bool = False

