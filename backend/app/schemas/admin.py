
from typing import Literal, Optional

from pydantic import BaseModel, Field


class OrganizerVerificationRequest(BaseModel):
    verification_status: Literal["verified", "rejected"]
    rejection_reason: Optional[str] = Field(
        default=None,
        max_length=1000
    )
