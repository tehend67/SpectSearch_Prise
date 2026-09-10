from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler(daemon=True)


def start(job, minutes=5):
    if scheduler.running:
        return
    scheduler.add_job(job, "interval", minutes=minutes, id="market-tick", replace_existing=True)
    scheduler.start()


def stop():
    if scheduler.running:
        scheduler.shutdown(wait=False)
