from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.locations import District, Taluka, Village
from app.schemas.locations import DistrictBase, TalukaBase, VillageBase

router = APIRouter(tags=["Locations & Administrative Boundaries"])

@router.get("/districts", response_model=List[DistrictBase])
def get_districts(db: Session = Depends(get_db)):
    return db.query(District).all()

@router.get("/talukas", response_model=List[TalukaBase])
def get_talukas(district_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Taluka)
    if district_id is not None:
        q = q.filter(Taluka.district_id == district_id)
    return q.all()

@router.get("/villages", response_model=List[VillageBase])
def get_villages(taluka_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Village)
    if taluka_id is not None:
        q = q.filter(Village.taluka_id == taluka_id)
    return q.all()
