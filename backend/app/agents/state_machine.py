from typing import TypedDict, Optional, List
from langgraph.graph import StateGraph, END
from celery_app import app as celery_app

class CaseState(TypedDict):
    case_id: str
    status: str
    intake_result: Optional[dict]
    location_result: Optional[dict]
    dedup_result: Optional[dict]
    priority_result: Optional[dict]
    routing_result: Optional[dict]
    depth_result: Optional[dict]
    verification_result: Optional[dict]
    errors: List[str]
    current_runtime: str
    timeline: List[dict]

def intake_node(state: CaseState) -> CaseState:
    celery_app.send_task('process_intake', args=[state['case_id'], {}], queue='intake')
    state['current_runtime'] = 'intake'
    state['timeline'].append({"event": "Intake task dispatched"})
    return state

def localization_node(state: CaseState) -> CaseState:
    state['current_runtime'] = 'localization'
    state['timeline'].append({"event": "Localization performed"})
    return state

def dedup_node(state: CaseState) -> CaseState:
    celery_app.send_task('check_duplicates', args=[state['case_id']], queue='dedup')
    state['current_runtime'] = 'dedup'
    state['timeline'].append({"event": "Dedup task dispatched"})
    return state

def priority_node(state: CaseState) -> CaseState:
    celery_app.send_task('calculate_priority', args=[state['case_id']], queue='priority')
    state['current_runtime'] = 'priority'
    state['timeline'].append({"event": "Priority task dispatched"})
    return state

def routing_node(state: CaseState) -> CaseState:
    state['current_runtime'] = 'routing'
    state['routing_result'] = {"department": "assigned_dept"}
    state['timeline'].append({"event": "Routing complete"})
    return state

def depth_node(state: CaseState) -> CaseState:
    celery_app.send_task('estimate_depth', args=[state['case_id'], "dummy_evidence"], queue='depth')
    state['current_runtime'] = 'depth'
    state['timeline'].append({"event": "Depth task dispatched"})
    return state

def verification_node(state: CaseState) -> CaseState:
    celery_app.send_task('verify_closure', args=[state['case_id'], "dummy_verification"], queue='verification')
    state['current_runtime'] = 'verification'
    state['timeline'].append({"event": "Verification task dispatched"})
    return state

def route_after_intake(state: CaseState) -> str:
    if state.get('errors'):
        return 'human_review'
    return 'localization'

def route_after_localization(state: CaseState) -> str:
    return 'dedup'

def route_after_dedup(state: CaseState) -> str:
    if state.get('dedup_result', {}).get('status') == 'duplicate':
        return 'link_and_skip_dispatch'
    return 'priority'

def route_after_priority(state: CaseState) -> str:
    return 'routing'

workflow = StateGraph(CaseState)

workflow.add_node("intake", intake_node)
workflow.add_node("localization", localization_node)
workflow.add_node("dedup", dedup_node)
workflow.add_node("priority", priority_node)
workflow.add_node("routing", routing_node)
workflow.add_node("human_review", lambda state: state)
workflow.add_node("link_and_skip_dispatch", lambda state: state)

workflow.set_entry_point("intake")

workflow.add_conditional_edges("intake", route_after_intake, {
    "human_review": "human_review",
    "localization": "localization"
})

workflow.add_conditional_edges("localization", route_after_localization, {
    "dedup": "dedup"
})

workflow.add_conditional_edges("dedup", route_after_dedup, {
    "link_and_skip_dispatch": "link_and_skip_dispatch",
    "priority": "priority"
})

workflow.add_conditional_edges("priority", route_after_priority, {
    "routing": "routing"
})

workflow.add_edge("routing", END)
workflow.add_edge("human_review", END)
workflow.add_edge("link_and_skip_dispatch", END)

app_graph = workflow.compile()

@celery_app.task(name='process_new_case')
def process_new_case(case_id: str):
    initial_state = {
        "case_id": case_id,
        "status": "new",
        "intake_result": None,
        "location_result": None,
        "dedup_result": None,
        "priority_result": None,
        "routing_result": None,
        "depth_result": None,
        "verification_result": None,
        "errors": [],
        "current_runtime": "start",
        "timeline": []
    }
    app_graph.invoke(initial_state)
