
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth_middleware import require_roles
from app.schemas.orders import CreateOrderRequest
from app.services.order_service import (
    create_order,
    get_customer_orders,
    get_customer_order_detail,
    cancel_order,
)

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_new_order(
    payload: CreateOrderRequest,
    current_user: dict = Depends(require_roles("customer")),
):
    try:
        result = create_order(
            customer_id=current_user["id"],
            ticket_category_id=str(payload.ticket_category_id),
            quantity=payload.quantity,
        )

        return {
            "success": True,
            "message": "Pesanan berhasil dibuat.",
            "data": result,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.get("/my-orders")
def my_orders(
    current_user: dict = Depends(require_roles("customer")),
):
    try:
        orders = get_customer_orders(
            customer_id=current_user["id"],
        )

        return {
            "success": True,
            "data": orders,
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal mengambil daftar pesanan.",
        )


@router.get("/{order_id}")
def order_detail(
    order_id: UUID,
    current_user: dict = Depends(require_roles("customer")),
):
    try:
        order = get_customer_order_detail(
            order_id=str(order_id),
            customer_id=current_user["id"],
        )

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pesanan tidak ditemukan.",
            )

        return {
            "success": True,
            "data": order,
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal mengambil detail pesanan.",
        )


@router.patch("/{order_id}/cancel")
def cancel_customer_order(
    order_id: UUID,
    current_user: dict = Depends(require_roles("customer")),
):
    try:
        cancel_order(
            order_id=str(order_id),
            customer_id=current_user["id"],
        )

        return {
            "success": True,
            "message": "Pesanan berhasil dibatalkan.",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )
