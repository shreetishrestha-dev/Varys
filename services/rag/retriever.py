# services/rag/retriever.py

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings

def get_company_retriever(company: str):
    path = f"vectorstores/{company.lower()}_mentions"
    embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
    vectorstore = FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    
    return vectorstore.as_retriever(search_kwargs={"k": 5})