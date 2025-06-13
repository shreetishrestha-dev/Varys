from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableMap
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4.1-nano", temperature=0)

def load_prompt(path):
    with open(path, "r") as f:
        return PromptTemplate.from_template(f.read())

translate_prompt = load_prompt("prompts/translate_prompt.txt")
classify_prompt = load_prompt("prompts/classify_prompt.txt")
sentiment_prompt = load_prompt("prompts/sentiment_prompt.txt")
keywords_prompt = load_prompt("prompts/keywords_prompt.txt")

preprocessing_chain = RunnableMap({
    "translated": translate_prompt | llm,
    "type": classify_prompt | llm,
    "sentiment": sentiment_prompt | llm,
    "keywords": keywords_prompt | llm
})

