
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, model_validator
from uuid import UUID


class CreateTicketCategoryRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    price: Decimal = Field(ge=0)
    quota: int = Field(ge=0)
    sales_start: datetime | None = None
    sales_end: datetime | None = None

    @model_validator(mode="after")
    def validate_sales_period(self):
        if (
            self.sales_start is not None
            and self.sales_end is not None
            and self.sales_start >= self.sales_end
        ):
            raise ValueError(
                "sales_end harus setelah sales_start."
            )
        return self


class UpdateTicketCategoryRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    quota: int | None = Field(default=None, ge=0)
    sales_start: datetime | None = None
    sales_end: datetime | None = None
