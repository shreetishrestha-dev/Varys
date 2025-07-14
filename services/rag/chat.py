from services.rag.retriever import get_company_retriever
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

def get_rag_response(company: str, query: str) -> str:
    retriever = get_company_retriever(company)
    llm = ChatOpenAI(model="gpt-4.1-nano", temperature=0)
    
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=False
    )
    return chain.run(query)