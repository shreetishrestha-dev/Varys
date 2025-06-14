from langchain.agents import Tool, AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from tools.retrieve_mentions_tool import retrieve_mentions

llm = ChatOpenAI(model="gpt-4.1-nano", temperature=0)

tools = [retrieve_mentions]

prompt = PromptTemplate.from_template("""
Use the tool to retrieve relevant mentions from the company review database.

{input}

{agent_scratchpad}
""")

agent = create_openai_functions_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)