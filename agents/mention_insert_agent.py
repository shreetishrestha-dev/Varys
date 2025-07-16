from langchain_openai import ChatOpenAI
from langchain.agents import Tool, AgentExecutor, create_openai_functions_agent
from langchain_core.prompts import PromptTemplate
from tools.mention_insert_tool import insert_mention
from config import LLM_MODEL

llm = ChatOpenAI(model=LLM_MODEL, temperature=0)

def load_prompt(path):
    with open(path, "r") as f:
        return PromptTemplate.from_template(f.read())

db_transformer_prompt = load_prompt("prompts/db_transformer_prompt.txt")

tools = [insert_mention]

agent = create_openai_functions_agent(
    llm=llm,
    tools=tools,
    prompt=db_transformer_prompt,
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)