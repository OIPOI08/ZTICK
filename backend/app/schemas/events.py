
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class EventCreate(BaseModel):
    category_id: str
    title: str = Field(min_length=3, max_length=200)
    slug: str = Field(min_length=3, max_length=220)
    description: Optional[str] = None
    poster_url: Optional[str] = None
    venue_name: str
    venue_address: str
    city: str
    start_date: datetime
    end_date: datetime


class EventUpdate(BaseModel):
    category_id: Optional[str] = None
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    poster_url: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    city: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
