# # from PIL import Image

# # from input import prepare_input , extract_medicine_details
# # from search import find_substitutes 

# # input_path = "/home/merac/Downloads/hack/tablet.png"

# # # prepare input messages
# # messages = prepare_input(input_path)
# # # json output from the model 
# # #  {"Medicine_name": "DIMONIC-DCA", "Salt": "Phentyline", "Strength": "10 mg"}
# # result = extract_medicine_details(messages)

# # print(result)

# # """""
# # "name": item.get("name") or item.get("title") or "",
# #                 "salt": salt_name,
# #                 "strength": item.get("strength") or "",
# #                 "brand": item.get("brand") or item.get("manufacturer") or "",
# #                 "source": "1mg_api",
# #                 "Uses": item.get('Uses', ""),
# #                 "Side Effect": item.get('Side Effect', ""),
# #                 "Dosages": item.get('Dosages', ""),
# #                 "Working": item.get('Working', ""),
# #                 "url": item.get("url", "")


# # """

# # med = result.get("Medicine_name","")
# # salt = result.get("Salt","")

# # res = find_substitutes(salt, med)

# # med_subs = res.get("Substitutes",[])


# # main.py
# from fastapi import FastAPI, File, UploadFile, HTTPException
# from PIL import Image
# import io
# import json
# import uvicorn

# # Import your helper functions
# from input import prepare_input, extract_medicine_details
# from search import find_substitutes

# app = FastAPI(title="Medic-OCR Substitutes API")


# @app.post("/extract_and_find_substitutes")
# async def extract_and_find_substitutes(file: UploadFile = File(...)):
#     try:
#         # Read uploaded image
#         image_bytes = await file.read()
#         image = Image.open(io.BytesIO(image_bytes))

#         # Prepare messages for LLM
#         messages = prepare_input(image=image)

#         # Extract JSON (string) from model
#         raw_result = extract_medicine_details(messages)

#         # Convert JSON string → dict
#         result = json.loads(raw_result)

#         # Extract name & salt
#         med = result.get("Medicine_name", "")
#         salt = result.get("Salt", "")

#         # Find substitutes
#         substitutes = find_substitutes(salt, med)

#         return {
#             "extracted": result,
#             "substitutes": substitutes
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error processing image: {e}")


# @app.get("/")
# async def root():
#     return {"message": "Medic-OCR substitute finder API is running!"}


# # ------------------------------
# # ▶ RUN WITH UVICORN (port 9188)
# # ------------------------------

# if __name__ == "__main__":
#     uvicorn.run(
#         "main:app",
#         host="0.0.0.0",
#         port=9188,
#         reload=True
#     )


# # main.py
# from fastapi import FastAPI, File, UploadFile, HTTPException, Form
# from PIL import Image
# import io
# import json
# import uvicorn

# # Import your helper functions
# from input import prepare_input, extract_medicine_details
# from search import find_substitutes

# app = FastAPI(title="Medic-OCR Substitutes API")


# @app.post("/extract_and_find_substitutes")
# async def extract_and_find_substitutes(
#     file: UploadFile = File(None),   # ⬅ allow optional image
#     text: str = Form(None)           # ⬅ allow optional text
# ):
#     try:
#         # --- CASE 1: TEXT INPUT ---
#         if text:
#             raw_result = extract_medicine_details([{"role": "user", "content": text}])
#             result = json.loads(raw_result)

#         # --- CASE 2: IMAGE INPUT ---
#         if file:
#             image_bytes = await file.read()
#             image = Image.open(io.BytesIO(image_bytes))

#             messages = prepare_input(image=image)
#             raw_result = extract_medicine_details(messages)
#             result = json.loads(raw_result)

#         # --- CASE 3: NO VALID INPUT ---
#         else:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Provide either 'file' (image) or 'text'."
#             )

#         # Extract name & salt
#         med = result.get("Medicine_name", "")
#         salt = result.get("Salt", "")

#         substitutes = find_substitutes(salt, med)

#         return {
#             "extracted": result,
#             "substitutes": substitutes
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error processing request: {e}")


# @app.get("/")
# async def root():
#     return {"message": "Medic-OCR substitute finder API is running!"}


# if __name__ == "__main__":
#     uvicorn.run(
#         "main:app",
#         host="0.0.0.0",
#         port=9188,
#         reload=True
#     )



from fastapi import FastAPI
from pydantic import BaseModel
import json
import uvicorn

# import your existing function
from search import find_substitutes  

app = FastAPI()

# Request model
class MedicineRequest(BaseModel):
    med: str
    limit: int = 5  # optional, default=5

@app.post("/substitutes")
async def get_substitutes(req: MedicineRequest):
    try:
        result = find_substitutes(req.med, req.limit)
        print(result)
        
        return result
    except Exception as e:
        return {"error": str(e)}
    
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9188,
        reload=True
    )
