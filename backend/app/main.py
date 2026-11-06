
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    auth,
    events,
    tickets,
    orders,
    ticket_categories,
    payments,
    dashboard,
    admin,
    checkin,
)

app = FastAPI(
    title="ZTICK API",
    description="Backend REST API untuk platform pembelian tiket konser ZTICK",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTER ROUTERS
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(tickets.router)
app.include_router(orders.router)
app.include_router(ticket_categories.router)
app.include_router(payments.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(checkin.router)


@app.get("/", tags=["Main"])
def root():
    return {
        "success": True,
        "message": "ZTICK Backend API berjalan!",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Main"])
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": "ZTICK API",
    }
