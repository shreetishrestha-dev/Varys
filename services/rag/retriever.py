# services/rag/retriever.py

from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

def get_company_retriever(company: str):
    path = f"vectorstores/{company.lower()}_mentions"
    embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
    vectorstore = FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    
    return vectorstore.as_retriever(search_kwargs={"k": 5})