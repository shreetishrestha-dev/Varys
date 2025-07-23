from langchain_core.runnables import RunnableSequence, RunnableParallel, RunnableLambda
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from config import LLM_MODEL

llm = ChatOpenAI(model=LLM_MODEL, temperature=0)

def load_prompt(path):
    with open(path, "r") as f:
        return PromptTemplate.from_template(f.read())

translate_prompt = load_prompt("prompts/translate_prompt.txt")
classify_prompt = load_prompt("prompts/classify_prompt.txt")
sentiment_prompt = load_prompt("prompts/sentiment_prompt.txt")
keywords_prompt = load_prompt("prompts/keywords_prompt.txt")
focus_company_prompt = load_prompt("prompts/focus_company_prompt.txt")

def get_preprocessing_chain(company_name):
    focused_prompt = focus_company_prompt.partial(company_name=company_name)

    # Step 1: Translate
    translate_chain = translate_prompt | llm

    # Step 2: Use translated text as input to parallel tasks
    postprocess_parallel = RunnableParallel({
        "focused_review": focused_prompt | llm,
        "type": classify_prompt | llm,
        "sentiment": sentiment_prompt | llm,
        "keywords": keywords_prompt | llm,
    })

    # Step 3: Wrap translated string as {"text": ...}
    prepare_input = RunnableLambda(lambda translated: {"text": translated})

    # Step 4: Combine into full sequence with translated also returned
    full_chain = RunnableSequence(
        translate_chain,
        prepare_input,
        RunnableLambda(lambda d: {
            "translated": d["text"],
            **postprocess_parallel.invoke(d)
        })
    )

    return full_chain