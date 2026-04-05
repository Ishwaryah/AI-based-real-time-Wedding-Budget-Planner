"""SQLAlchemy ORM models for WeddingBudget.AI."""
from datetime import datetime, timezone
from sqlalchemy import (
    Integer, String, Float, Text, DateTime, Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Artist(Base):
    __tablename__ = "artists"

    id:      Mapped[int]   = mapped_column(Integer, primary_key=True, index=True)
    name:    Mapped[str]   = mapped_column(String(255), nullable=False)
    type:    Mapped[str]   = mapped_column(String(100), nullable=False)
    min_fee: Mapped[float] = mapped_column(Float, nullable=False)
    max_fee: Mapped[float] = mapped_column(Float, nullable=False)
    city:    Mapped[str]   = mapped_column(String(100), nullable=False)


class FBRate(Base):
    __tablename__ = "fb_rates"
    __table_args__ = (
        UniqueConstraint("meal_type", "tier", "occasion", name="uq_fb_rate"),
    )

    id:            Mapped[int]   = mapped_column(Integer, primary_key=True, index=True)
    meal_type:     Mapped[str]   = mapped_column(String(50), nullable=False)
    tier:          Mapped[str]   = mapped_column(String(50), nullable=False)
    occasion:      Mapped[str]   = mapped_column(String(50), nullable=False)
    per_head_cost: Mapped[float] = mapped_column(Float, nullable=False)


class LogisticsCost(Base):
    __tablename__ = "logistics_costs"
    __table_args__ = (
        UniqueConstraint("city", "service_type", name="uq_logistics"),
    )

    id:           Mapped[int]   = mapped_column(Integer, primary_key=True, index=True)
    city:         Mapped[str]   = mapped_column(String(100), nullable=False)
    service_type: Mapped[str]   = mapped_column(String(100), nullable=False)
    unit_cost:    Mapped[float] = mapped_column(Float, nullable=False)
    unit:         Mapped[str]   = mapped_column(String(50), nullable=False, default="per_event")


class DecorImage(Base):
    __tablename__ = "decor_images"

    id:         Mapped[int]  = mapped_column(Integer, primary_key=True, index=True)
    style:      Mapped[str]  = mapped_column(String(100), nullable=False, index=True)
    image_path: Mapped[str]  = mapped_column(String(500), nullable=False)
    label:      Mapped[str]  = mapped_column(String(255), nullable=True)
    active:     Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class BudgetTracker(Base):
    __tablename__ = "budget_tracker"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str]      = mapped_column(String(255), nullable=False, index=True)
    category:   Mapped[str]      = mapped_column(String(100), nullable=False)
    estimated:  Mapped[float]    = mapped_column(Float, nullable=False)
    actual:     Mapped[float]    = mapped_column(Float, nullable=False)
    difference: Mapped[float]    = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class AdminSetting(Base):
    __tablename__ = "admin_settings"
    __table_args__ = (
        UniqueConstraint("key", name="uq_admin_key"),
    )

    id:    Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    key:   Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(String(500), nullable=False)


class CostVersion(Base):
    __tablename__ = "cost_versions"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    table_name: Mapped[str]      = mapped_column(String(100), nullable=False)
    record_id:  Mapped[int]      = mapped_column(Integer, nullable=False)
    old_value:  Mapped[str]      = mapped_column(Text, nullable=True)
    new_value:  Mapped[str]      = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class RLAgentState(Base):
    __tablename__ = "rl_agent_state"
    __table_args__ = (
        UniqueConstraint("category", name="uq_rl_category"),
    )

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    category:   Mapped[str]      = mapped_column(String(100), nullable=False)
    multiplier: Mapped[float]    = mapped_column(Float, nullable=False, default=1.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class RLTrainingLog(Base):
    __tablename__ = "rl_training_log"

    id:             Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    category:       Mapped[str]      = mapped_column(String(100), nullable=False, index=True)
    estimated:      Mapped[float]    = mapped_column(Float, nullable=False)
    actual:         Mapped[float]    = mapped_column(Float, nullable=False)
    ratio:          Mapped[float]    = mapped_column(Float, nullable=False)
    old_multiplier: Mapped[float]    = mapped_column(Float, nullable=False)
    new_multiplier: Mapped[float]    = mapped_column(Float, nullable=False)
    accuracy_delta: Mapped[float]    = mapped_column(Float, nullable=False)
    timestamp:      Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)
