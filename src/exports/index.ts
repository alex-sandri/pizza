export namespace pizza
{
    export type ServiceWorkerEvent = "updateready" | "beforeinstallprompt";

    export type ServiceWorkerEventData = {
        event?: Event,
    }

    export class ServiceWorker
    {
        private static sw: globalThis.ServiceWorker;

        private static listeners: {
            event: pizza.ServiceWorkerEvent,
            callback: (data?: pizza.ServiceWorkerEventData) => void,
        }[];

        public static register = () =>
        {
            if (!navigator.serviceWorker) return;

            window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").then(reg =>
            {
                if (!navigator.serviceWorker.controller) return;

                if (reg.waiting)
                {
                    pizza.ServiceWorker.sw = reg.waiting;

                    pizza.ServiceWorker.dispatchEvent("updateready");

                    return;
                }

                if (reg.installing)
                {
                    pizza.ServiceWorker.trackInstalling(reg.installing);

                    return;
                }

                reg.addEventListener("updatefound", () => pizza.ServiceWorker.trackInstalling(<globalThis.ServiceWorker>reg.installing));
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

                pizza.ServiceWorker.dispatchEvent("beforeinstallprompt", { event: e });
            });
        }

        public static listen(event: pizza.ServiceWorkerEvent, callback: () => void)
        {
            pizza.ServiceWorker.listeners.push({ event, callback });
        }

        public static update = (): void => pizza.ServiceWorker.sw.postMessage({ action: "skipWaiting" });

        private static dispatchEvent = (event: pizza.ServiceWorkerEvent, data?: pizza.ServiceWorkerEventData) =>
        {
            pizza.ServiceWorker.listeners
                .filter(listener => listener.event === event)
                .forEach(listener => listener.callback(data));
        }

        private static trackInstalling = (sw: globalThis.ServiceWorker) =>
            sw.addEventListener("statechange", () =>
            {
                if (sw.state === "installed")
                {
                    pizza.ServiceWorker.sw = sw;

                    pizza.ServiceWorker.dispatchEvent("updateready");
                }
            });
    }
}
