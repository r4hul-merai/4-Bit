# # input.py

# from transformers import pipeline
# from PIL import Image
# import torch

# pipe = pipeline(
#     "image-text-to-text",
#     model="google/medgemma-4b-it",
#     torch_dtype=torch.bfloat16,  # use float32 if CPU
#     device="cpu",
# )

# image = Image.open("/home/merac/Downloads/hack/tablet.png")

# messages = [
#     {
#         "role": "system",
#         "content": [
#             {
#                 "type": "text",
#                 "text": (
#                     "You are an expert medical OCR system. "
#                     "Extract only medicine name, salt name, and strength."
#                     "Output strictly in this JSON format:"
#                     '{"Medicine_name": "", "Salt": "", "Strength": ""}'
#                 )
#             }
#         ]
#     },
#     {
#         "role": "user",
#         "content": [
#             {"type": "text", "text": "Extract details from this image."},
#             {"type": "image", "image": image}
#         ]
#     }
# ]

# output = pipe(messages, max_new_tokens=200)
# print(output[0]["generated_text"][-1]["content"])


from transformers import pipeline
from PIL import Image
import torch


def prepare_input(image_path):
    image = Image.open(image_path)
    messages = [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "You are an expert medical OCR system. "
                        "Extract only medicine name, salt name, and strength."
                        "Output strictly in this JSON format:"
                        '{"Medicine_name": "", "Salt": "", "Strength": ""}'
                    )
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Extract details from this image."},
                {"type": "image", "image": image}
            ]
        }
    ]
    return messages


def extract_medicine_details(messages):
    pipe = pipeline(
        "image-text-to-text",
        model="google/medgemma-4b-it",
        torch_dtype=torch.bfloat16,
        device="cpu",
    )
    
    print
    output = pipe(messages, max_new_tokens=200)
    return output[0]["generated_text"][-1]["content"]


if __name__ == "__main__":
    input_path = "/home/merac/Downloads/hack/tablet.png"
    messages = prepare_input(input_path)
    result = extract_medicine_details(messages)
    print(result)
