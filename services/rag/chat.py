from services.rag.retriever import get_company_retriever
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from sqlalchemy.orm import Session
from services.db_setup import engine
from models.chat_sessions import ChatSession
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, AIMessage

def get_rag_response(company: str, query: str, session_id: str = "default") -> str:
    # 1. Load history from DB
    history = get_memory(session_id, company)

    # 2. Format messages into LangChain-compatible messages
    messages = []
    for role, msg in history:
        if role == "user":
            messages.append(HumanMessage(content=msg))
        else:
            messages.append(AIMessage(content=msg))

    # 3. Setup memory with the correct memory_key
    memory = ConversationBufferMemory(return_messages=True, memory_key="chat_history")
    memory.chat_memory.messages = messages

    # 4. Load retriever and LLM
    retriever = get_company_retriever(company)
    llm = ChatOpenAI(model="gpt-4.1-nano", temperature=0)

    # 5. Construct chain with memory
    qa = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        return_source_documents=False  # Optional
    )

    # 6. Ask question
    result = qa.invoke({"question": query})
    answer = result["answer"]

    # 7. Save to DB
    store_message(session_id, company, "user", query)
    store_message(session_id, company, "ai", answer)

    return answer

def store_message(session_id: str, company: str, role: str, message: str):
    with Session(engine) as db:
        db.add(ChatSession(
            session_id=session_id,
            company=company,
            role=role,
            message=message
        ))
        db.commit()

def get_memory(session_id: str, company: str):
    with Session(engine) as db:
        rows = db.query(ChatSession).filter_by(
            session_id=session_id,
            company=company
        ).order_by(ChatSession.timestamp).all()
        return [(row.role, row.message) for row in rows]
