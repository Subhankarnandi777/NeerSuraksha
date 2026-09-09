from app.services.sms_ivr_gateway import send_sms_alert

def dispatch_alert(source, new_status: str):
    """
    Trigger alerts when a water source reaches a dangerous threshold.
    """
    message = f"ALERT: Water source '{source.name}' is now classified as {new_status}."
    print(f"DISPATCHING ALERT: {message}")
    send_sms_alert(message)
