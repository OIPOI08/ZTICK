
from pydantic import BaseModel, Field
from uuid import UUID




class CreateOrderRequest(BaseModel):
    ticket_category_id: UUID
    quantity: int = Field(ge=1, le=10)




class CreateOrderRequest(BaseModel):
    ticket_category_id: UUID
    quantity: int = Field(ge=1, le=10)
