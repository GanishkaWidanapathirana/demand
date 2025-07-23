from urllib import request

from pydantic import BaseModel
from app.final_backend_approach_erandi_fyp import get_final_output
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from .. import database, models, schemas
from jose import jwt, JWTError
import os
from typing import List
import numpy as np


router = APIRouter(prefix="/foods", tags=["Foods"])
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

class PredictionInput(BaseModel):
    name: str
    cash_on_hand: float

def get_user_id(token: str = Header(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_town(user_id: int = Depends(get_user_id), db: Session = Depends(database.get_db)) -> str:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.town  # assuming town is a field in user table

def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(v) for v in obj]
    elif isinstance(obj, np.generic):
        return obj.item()
    else:
        return obj
    
@router.post("/", response_model=schemas.FoodOut)
def add_food(food: schemas.FoodCreate, user_id: int = Depends(get_user_id), db: Session = Depends(database.get_db)):
    new_food = models.Food(**food.dict(), owner_id=user_id)
    db.add(new_food)
    db.commit()
    db.refresh(new_food)
    return new_food

@router.get("/", response_model=List[schemas.FoodOut])
def get_user_foods(user_id: int = Depends(get_user_id), db: Session = Depends(database.get_db)):
    return db.query(models.Food).filter(models.Food.owner_id == user_id).all()

@router.post("/prediction")
async def get_final(
    data: PredictionInput,
    town: str = Depends(get_user_town)
):
    fruit = data.name.lower()
    cash = data.cash_on_hand

    print("Fruit:", fruit)
    print("Cash on Hand:", cash)
    print("Town:", town)

    result = get_final_output(fruit, cash, town)
    result = convert_numpy_types(result)

    return {"result": result}