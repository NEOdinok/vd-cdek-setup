"use client";
import Script from "next/script";
import { useState, useRef, useEffect } from "react";
import {
  CdekSelectedDeliveryMode,
  CdekSelectedAddress,
  CdekSelectedTariff,
} from "@/types";

export const Cdek = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [pickupPointAddress, setPickupPointAddress] = useState("");
  const [widgetReady, setWidgetReady] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [deliveryTariff, setDeliveryTariff] = useState("");

  const handleSelectPickupPoint = (
    address: string,
    price: number,
    tariff: string
  ) => {
    console.log("Pickup point selected");
    console.log("Address:", address);
    console.log("Price:", price);
    console.log("Tariff:", tariff);
  };

  /**Copied stuff */

  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const getUserLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  };

  useEffect(() => {
    getUserLocation()
      .then((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);
      })
      .catch((error) => {
        console.error(
          "Error getting user location. Fallback to Moscow Kremlin 🇷🇺🐻🪆:",
          error
        );
        setUserLocation([37.617664, 55.752121]);
      });
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !userLocation) return;

    const initializeCDEKWidget = (
      servicePath: string,
      setPrice: React.Dispatch<React.SetStateAction<number>>,
      setIsWidgetReady: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!document.getElementById("cdek-map")) return;

      const cdekWidget = new window.CDEKWidget({
        from: {
          country_code: "RU",
          city: "Видное",
          postal_code: 142701,
          code: 1100,
          address: "ул. Советская, 10/1",
        },
        canChoose: true,
        hideFilters: {
          have_cashless: false,
          have_cash: false,
          is_dressing_room: false,
          type: false,
        },
        hideDeliveryOptions: {
          office: false,
          door: true,
        },
        defaultLocation: userLocation,
        goods: [
          {
            width: 20,
            height: 10,
            length: 20,
            weight: 0.5,
          },
        ],
        root: "cdek-map",
        apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_SECRET,
        servicePath: servicePath,
        lang: "rus",
        currency: "RUB",
        tariffs: {
          // office: [234, 136, 138, 294, 291],
          office: [234, 136],
          // door: [233, 137, 139, 7],
        },
        onReady() {
          setIsWidgetReady(true);
        },
        onChoose(
          mode: CdekSelectedDeliveryMode,
          tariff: CdekSelectedTariff,
          office: CdekSelectedAddress
        ) {
          setPrice(tariff.delivery_sum);
          setPickupPointAddress(`${office.city} ${office.address}`);
          setDeliveryAddress(`${office.city} ${office.address}`);
          setDeliveryTariff(
            `${tariff.tariff_description} ${tariff.tariff_name}`
          );
          handleSelectPickupPoint(
            `${office.city} ${office.address}`,
            tariff.delivery_sum,
            `${tariff.tariff_description} ${tariff.tariff_name}`
          );
        },
        onCalculate(obj: unknown) {
          console.log("[Widget] onCalculate", obj);
        },
      });

      if (cdekWidget) {
        window.CDEKWidgetInitialized = true;
      }
    };

    const servicePath = `${process.env.NEXT_PUBLIC_SITE_URL}/api/cdek`;

    if (document.getElementById("cdek-map") && !window.CDEKWidgetInitialized) {
      setWidgetReady(false);
      initializeCDEKWidget(servicePath, setDeliveryPrice, setWidgetReady);
    }
  }, [
    scriptLoaded,
    setDeliveryPrice,
    userLocation,
    deliveryAddress,
    deliveryPrice,
    deliveryTariff,
  ]);

  return (
    <>
      <div className="h-full relative flex flex-col" defaultValue="delivery">
        <div className="h-full">
          <div id="cdek-tab" className="relative flex flex-col p-0 h-full">
            <div
              id="cdek-map"
              className={!widgetReady ? "hidden" : "h-full"}
              ref={widgetContainerRef}
            ></div>

            {!widgetReady && <WidgetLoadingState />}
          </div>
        </div>

        {pickupPointAddress && (
          <div>
            <span className="font-mono">Выбранный пункт: </span>
            <span className="font-mono">{pickupPointAddress}</span>
          </div>
        )}
      </div>

      <Script
        src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"
        strategy="afterInteractive"
        async
        onLoad={() => setScriptLoaded(true)}
      />
    </>
  );
};

const WidgetLoadingState = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      Loading...
    </div>
  );
};
