from langchain_core.runnables import RunnableSequence, RunnableParallel, RunnableLambda
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from config import LLM_MODEL

llm = ChatOpenAI(model=LLM_MODEL, temperature=0)

def load_prompt(path):
    with open(path, "r") as f:
        return PromptTemplate.from_template(f.read())

# Load prompts
translate_prompt = load_prompt("prompts/translate_prompt.txt")
classify_prompt = load_prompt("prompts/classify_prompt.txt")
sentiment_prompt = load_prompt("prompts/sentiment_prompt.txt")
keywords_prompt = load_prompt("prompts/keywords_prompt.txt")
focus_company_prompt = load_prompt("prompts/focus_company_prompt.txt")
preprocess_prompt = load_prompt("prompts/preprocess_mentions_prompt.txt")

# Helper to unwrap content from AIMessage
unwrap = RunnableLambda(lambda msg: msg.content)

def get_preprocessing_chain(company_name):
    preprocess_chain = preprocess_prompt | llm | unwrap
    translate_chain = translate_prompt | llm | unwrap
    # focused_company_prompt_chain = focus_company_prompt.partial(company_name=company_name) | llm | unwrap
    

    prepare_input = RunnableLambda(lambda translated: {
        "text": translated,
        "company_name": company_name
    })

    type_chain = RunnableLambda(lambda d: {
        **d,
        "type": (classify_prompt | llm | unwrap).invoke(d)
    })

    # Step 3: Feed into sentiment + keywords
    sentiment_chain = sentiment_prompt | llm | unwrap
    keywords_chain = keywords_prompt | llm | unwrap

    postprocess_chain = type_chain | RunnableParallel({
        "sentiment": sentiment_chain,
        "keywords": keywords_chain
    })

    full_chain = RunnableSequence(
        preprocess_chain,
        translate_chain,
        prepare_input,
        postprocess_chain
    )

    return full_chain