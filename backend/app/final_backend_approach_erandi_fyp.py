import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime
import holidays
import re
import inflect
import joblib
import requests
from bs4 import BeautifulSoup

main_path = fr"E:\Project\demand\backend\app\resources"

def extract_min_value(value):
    if pd.isna(value):
        return None
    match = re.search(r"(\d+)-(\d+)", str(value))
    if match:
        return int(match.group(1))
    match = re.search(r"(\d+)", str(value))
    if match:
        return int(match.group(1))
    return None

def get_fruit_expire_data():
  df = pd.read_csv(fr'{main_path}\fruit_storage_data.csv')
  df["Room Temperature (Days)"] = df["Room Temperature"].apply(extract_min_value)
  df["Refrigerated (Days)"] = df["Refrigerated"].apply(extract_min_value)
  df["Frozen (Months)"] = df["Frozen"].apply(extract_min_value)
  df = df.drop(columns=["Room Temperature", "Refrigerated", "Frozen"])
  cleaned_csv_filename = "fruit_storage_converted.csv"
  df.to_csv(cleaned_csv_filename, index=False)
  fruit_refrigerated_dict = df.set_index("Fruit")["Refrigerated (Days)"].to_dict()
  p = inflect.engine()

  new_fruit_data = {}

  for key, value in fruit_refrigerated_dict.items():
      cleaned = re.sub(r'\([^)]*\)', '', key).strip().lower()
      parts = re.split(r',|\band\b', cleaned)
      parts = [p.singular_noun(part.strip()) or part.strip() for part in parts]
      singular_key = ', '.join(parts)
      new_fruit_data[singular_key] = value

  print(new_fruit_data)
  return new_fruit_data

fruits = {'apple': 0, 'mango': 1, 'orange': 2, 'pineapple': 3, 'woodapple': 4, 'watermelon': 5, 'papaya': 6, 'avocado': 7, 'dragonfruit': 8, 'anoda': 9, 'banana': 10}
demand_fruits = {'cranberry': 0, 'apple': 1, 'banana': 2, 'mango': 3, 'pineapple': 4, 'avacado': 5, 'tomato': 6}

fruit_price_model = joblib.load(fr"{main_path}\model.pkl")
demand_model = joblib.load(fr"{main_path}\demand_prediction_model_cpi.pkl")

API_KEY = '5050aa1af8fc46e0a1c112033250907'  # Replace with your actual key
LOCATION = 'German'
weather_description = {'light snow': 0, 'broken clouds': 1, 'overcast clouds': 2, 'scattered clouds': 3, 'few clouds': 4, 'light rain': 5, 'snow': 6, 'sky is clear': 7, 'moderate rain': 8}

def get_wheather_data(type_ , no_of_days):
  DAYS = no_of_days
  feature_data = []
  url = f"http://api.weatherapi.com/v1/forecast.json?key={API_KEY}&q={LOCATION}&days={DAYS}&aqi=no&alerts=no"

  response = requests.get(url)
  data = response.json()
  for day in data['forecast']['forecastday']:
      hourly_data = day['hour'][12]
      condition = day['day']['condition']
      if type_ == 1:
        day_info = {
          'temp': day['day']['avgtemp_c']+273.15,
          'temp_max': day['day']['maxtemp_c']+273.15,
          'temp_min': day['day']['mintemp_c']+273.15,
          'feels_like': hourly_data['feelslike_c']+273.15,
          'humidity': day['day']['avghumidity'],
          'wind_speed': day['day']['maxwind_kph'],
          'wind_deg': hourly_data['wind_degree'],
          'pressure': hourly_data['pressure_mb'],
          'dew_point': hourly_data['dewpoint_c'],
          'clouds_all': hourly_data['cloud'],
          'weather_main':condition['code'],            # numeric weather code
          'weather_description': weather_description.get(condition['text'].lower(), 0)
        }
        print(day_info)
      else:
        day_info = {
          'temp': day['day']['avgtemp_c']+273.15,
          'temp_max': day['day']['maxtemp_c']+273.15,
          'temp_min': day['day']['mintemp_c']+273.15,
          'feels_like': hourly_data['feelslike_c']+273.15,
          'humidity': day['day']['avghumidity'],
          'wind_speed': day['day']['maxwind_kph'],
          'wind_deg': hourly_data['wind_degree'],
          'pressure': hourly_data['pressure_mb'],
          'dew_point': hourly_data['dewpoint_c'],
          'clouds_all': hourly_data['cloud'],
        }
        print(day_info)
      feature_data.append(day_info)
  return feature_data

def get_dates(fruit):
  new_fruit_data = get_fruit_expire_data()
  no_of_dates = new_fruit_data[fruit]
  return no_of_dates

def get_price_predictions(fruit):
  global fruit_price_model,fruits
  dates = get_dates(fruit)
  prices = {}
  i=1
  feature_list = get_wheather_data(0 , dates)
  for features in feature_list:
    features['fruit_type'] = fruits[fruit]
    df = pd.DataFrame([features])
    array = df.to_numpy().flatten()
    print(array)
    X = pd.get_dummies(df)
    print(X)
    prices[i] = float(fruit_price_model.predict([array])[0])
    i+=1
  return prices

def get_demand_predictions(fruit,today_price=100):
  global demand_model,demand_fruits
  dates = get_dates(fruit)
  demands = {}
  i=1
  feature_list = get_wheather_data(1 , dates)
  for features in feature_list:
    features['Product'] = demand_fruits[fruit]
    features['Unit_Price'] = today_price
    features['Discount'] = 0
    features['Total_Price'] = today_price
    features['cpi'] = 120.8
    df = pd.DataFrame([features])
    array = df.to_numpy().flatten()
    print(array)
    X = pd.get_dummies(df)
    print(X)
    demands[i] = float(demand_model.predict([array])[0])
    i+=1
  return demands

def get_final_inventory(prices,demands,cash_on_hand = 10000*700):
  result = {}
  price1 = prices[1]
  demand1 = demands[1]
  units_buy = int(cash_on_hand / price1)
  if units_buy >0:
    cash_balance = cash_on_hand - (price1*demand1)
    cash_on_hand = cash_balance
  result[1] = {"units_buy":units_buy, "cash_on_hand":cash_on_hand, 'status':'Necessary'}
  del prices[1]
  del demands[1]
  for n in prices:
    print(price1 , prices[n])
    if price1 < prices[n]:
      demand = demands[n]
      price = prices[n]
      units_buy = int(cash_on_hand / prices[n])
      if units_buy >0:
        cash_balance = cash_on_hand - (units_buy*prices[n])
        cash_on_hand = cash_balance
      result[n] = {"units_buy":units_buy, "cash_on_hand":cash_on_hand, 'status':'Price1 is Lower'}
      if cash_on_hand<= 0:
        break
    else:
      result[n] = {"units_buy":0, "cash_on_hand":cash_on_hand,'status':'Price1 is Higher'}
      break
  return result

def get_inventory_operation(fruit,cash_on_hand= 10000*700 ):
  demands = get_demand_predictions(fruit)
  prices = get_price_predictions(fruit)
  print(prices)
  return get_final_inventory(prices,demands,cash_on_hand) , get_demand_predictions(fruit)

def extract_data(url , data , i):
  content = requests.get(url=url)
  soup = BeautifulSoup(content.content, features="html.parser")
  list_juices = soup.find_all('span', attrs={'class': 'fx fq fy be di bg dj b1'})
  list_shops = soup.find_all('div', attrs={'class': 'eo cp cm af ep'})
  list_prices = soup.find_all('span', attrs={'class': 'fx fq fy be bf g0 dj b1'})
  print(list_juices)
  print(list_prices)
  print(list_shops)
  if len(list_juices) > len(list_prices):
    return data , i
  j = 0
  for juice in list_juices:
    soup = BeautifulSoup(str(juice), "html.parser")
    juice_name = soup.get_text()
    while True:
      soup = BeautifulSoup(str(list_prices[j]), "html.parser")
      juice_price = soup.get_text()
      try:
        juice_price = int(re.search(r"\d+", juice_price).group())
        print(juice_price)
        data[str(i)] = {
            'name': juice_name,
            'price': juice_price
        }
        i += 1
        j+=1
        break
      except:
        i += 1
        j+=1
  print(data)
  return data , i

def create_data_extraction(shops):
  data = {}
  i = 0
  for shop in shops:
    data , i = extract_data(shop , data , i)
    print(data)
  df = pd.DataFrame.from_dict(data, orient='index')
  print(df)
  df['name'] = df['name'].str.lower()
  price_stats_df = df.groupby('name')['price'].agg(['min', 'max']).reset_index()
  price_stats_df.to_csv(f'{main_path}/price_stats_df.csv', index=False)
  return price_stats_df

def get_competitive_mini_max(fruit,town = "Piliyandala"):
  shops_df = pd.read_csv(fr"{main_path}\Fruits juice shops.csv")
  filtered_df = shops_df[shops_df['Location'] == town]
  shop_list = filtered_df['Link'].tolist()
  price_stats_df = create_data_extraction(shop_list)
  filtered_df = price_stats_df[price_stats_df['name'].str.contains(fruit, case=False)]
  result = filtered_df.to_dict(orient='records')
  return result

scaler = joblib.load(fr"{main_path}\scaler.pkl")

def scale_output(inputs):
    pred, min_v, max_v = inputs
    return pred * (max_v - min_v) + min_v

from keras.models import load_model
# Make sure scale_output is imported before loading
model = load_model(fr'{main_path}/price_optimiser_model.keras', custom_objects={'scale_output': scale_output})

def get_optimal_price_predictions(fruit,custom_min,custom_max,demands,model):
  global scaler
  dates = get_dates(fruit)
  optimal_prices = {}
  i=1
  feature_list = get_wheather_data(1 , 1)
  for features in feature_list:
    formatted = {
    'temp': features['temp'],
    'dew_point': features['dew_point'],
    'feels_like': features['feels_like'],
    'temp_min': features['temp_min'],
    'temp_max': features['temp_max'],
    'pressure': features['pressure'],
    'humidity': features['humidity'],
    'wind_speed': features['wind_speed'],
    'wind_deg': features['wind_deg'],
    'clouds_all': features['clouds_all'],
    'weather_main': features['weather_main'],
    'weather_description': features['weather_description'],
    'Product': demand_fruits[fruit],
    'cpi':120.8,
    'demand': demands[i]
}
    df = pd.DataFrame([formatted])
    X_test = pd.get_dummies(df)
    X = scaler.transform(X_test)
    print(X)
    min_input = np.full((X_test.shape[0], 1), custom_min)
    max_input = np.full((X_test.shape[0], 1), custom_max)
    y_pred = model.predict([X_test, min_input, max_input])[0]
  return y_pred[0]

def get_final_optimal_prices(fruit,demands,model,town):
  products = get_competitive_mini_max(fruit,town)
  optimal_prices = {}
  for product in products:
    if product['min'] >= product['max']:
      product['min'] = product['max']/2
    optimal_price = get_optimal_price_predictions(fruit,product['min'],product['max'],demands,model)
    optimal_prices[product['name']] = optimal_price
  return optimal_prices

def get_final_output(fruit , cash_on_hand,town):
  global model
  inventory , demands = get_inventory_operation(fruit,cash_on_hand)
  optimal_price = get_final_optimal_prices(fruit,demands,model,town)
  return {
      'inventory': inventory,
      'demand': demands,
      'optimal_price': optimal_price
  }
