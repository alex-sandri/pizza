export type ServiceWorkerEvent = "updateready" | "beforeinstallprompt";

export type ServiceWorkerEventData = {
	event?: Event,
}

export class ServiceWorker
{
	private static sw?: globalThis.ServiceWorker;

	private static listeners: {
		event: ServiceWorkerEvent,
		callback: (data?: ServiceWorkerEventData) => void,
	}[] = [];

	public static register = (): void =>
	{
		if (!navigator.serviceWorker) return;

		window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").then(reg =>
		{
			if (!navigator.serviceWorker.controller) return;

			if (reg.waiting)
			{
				ServiceWorker.sw = reg.waiting;

				ServiceWorker.dispatchEvent("updateready");

				return;
			}

			if (reg.installing)
			{
				ServiceWorker.trackInstalling(reg.installing);

				return;
			}

			reg.addEventListener("updatefound", () => ServiceWorker.trackInstalling(<globalThis.ServiceWorker>reg.installing));
		}));

		// Ensure refresh is only called once.
		// This works around a bug in "force update on reload".
		let refreshing: boolean;

		navigator.serviceWorker.addEventListener("controllerchange", () =>
		{
			if (refreshing) return;

			location.reload();

			refreshing = true;
		});

		window.addEventListener("beforeinstallprompt", e =>
		{
			e.preventDefault();

			ServiceWorker.dispatchEvent("beforeinstallprompt", { event: e });
		});
	}

	public static listen(event: ServiceWorkerEvent, callback: () => void): void
	{
		ServiceWorker.listeners.push({ event, callback });
	}

	public static update = (): void => ServiceWorker.sw?.postMessage({ action: "skipWaiting" });

	private static dispatchEvent = (event: ServiceWorkerEvent, data?: ServiceWorkerEventData) =>
	{
		ServiceWorker.listeners
			.filter(listener => listener.event === event)
			.forEach(listener => listener.callback(data));
	}

	private static trackInstalling = (sw: globalThis.ServiceWorker) =>
		sw.addEventListener("statechange", () =>
		{
			if (sw.state === "installed")
			{
				ServiceWorker.sw = sw;

				ServiceWorker.dispatchEvent("updateready");
			}
		});
}
