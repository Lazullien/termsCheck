import json
from openai import OpenAI
from fastapi import FastAPI
from typing import List, Union

from starlette.responses import JSONResponse


def RequestDeepseek(system_prompt,user_prompt):
    # 请替换为你的 API 密钥
    api_key = "sk-79e5d27cc085498ea8d417e240836ef0"

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.deepseek.com",
    )

    messages = [{"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}]

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        response_format={
            'type': 'json_object'
        },
        temperature=0
    )

    #输出
    print(response.choices[0].message.content)

    return response.choices[0].message.content



app=FastAPI()
@app.get("/")
def root():
    return {"message": "Hello World"}

@app.post("/api/questions/")
def questions(message_request:str,message_content:str,session_id:int):
    """
    根据条文问ai问题
    :param message_request: 问题
    :param message_content: 条文内容
    :param session_id: 会话id
    :return: 返回问题编号和回答内容
    """
    system_prompt = open("prompt.md","r",encoding="utf-8").read().replace("{question}",message_request)
    user_prompt = message_content
    content=RequestDeepseek(system_prompt,user_prompt)

    return JSONResponse(content=content)

# 按装订区域中的绿色按钮以运行脚本。
if __name__ == '__main__':
    pass
    # system_prompt = open("prompt.md","r",encoding="utf-8").read().replace("{question}","隐私相关")
    # print(questions("隐私相关",open("import.md","r",encoding="utf-8").read(),1))