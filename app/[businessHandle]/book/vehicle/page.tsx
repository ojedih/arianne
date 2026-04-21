"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { Car } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { VehicleInfoSchema } from "@/lib/validations";
import { filterMakes } from "@/lib/vehicleMakes";
import type { VehicleInfo, VehicleBodyClass } from "@/types";

const CURRENT_YEAR = new Date().getFullYear();

function isValidYear(val: string): boolean {
  const n = parseInt(val, 10);
  return val.length === 4 && n > 1900 && n <= CURRENT_YEAR + 1;
}

export default function VehiclePage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { vehicle, setVehicle, setNavigationDirection } = useBookingStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleInfo>({
    resolver: zodResolver(VehicleInfoSchema),
    defaultValues: vehicle ?? { year: "", make: "", model: "" },
  });

  const yearValue = watch("year");
  const makeValue = watch("make");

  const makeInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([]);
  const [showMakeDrop, setShowMakeDrop] = useState(false);
  const makeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
  const [showModelDrop, setShowModelDrop] = useState(false);
  const [modelFilter, setModelFilter] = useState(vehicle?.model ?? "");
  const modelsFetchedRef = useRef<{ make: string; year: string } | null>(null);

  const prevYearRef = useRef(vehicle?.year ?? "");
  useEffect(() => {
    const wasValid = isValidYear(prevYearRef.current);
    const isValid = isValidYear(yearValue ?? "");
    if (isValid && !wasValid) {
      makeInputRef.current?.focus();
    }
    prevYearRef.current = yearValue ?? "";
  }, [yearValue]);

  const handleMakeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValue("make", val, { shouldValidate: false });

      if (makeDebounceRef.current) clearTimeout(makeDebounceRef.current);
      makeDebounceRef.current = setTimeout(() => {
        if (val.length >= 1) {
          setMakeSuggestions(filterMakes(val));
          setShowMakeDrop(true);
        } else {
          setMakeSuggestions([]);
          setShowMakeDrop(false);
        }
      }, 150);
    },
    [setValue]
  );

  function selectMake(make: string) {
    setValue("make", make, { shouldValidate: true });
    setMakeSuggestions([]);
    setShowMakeDrop(false);
    setValue("model", "", { shouldValidate: false });
    setModelSuggestions([]);
    setModelFilter("");
    modelsFetchedRef.current = null;
    setTimeout(() => modelInputRef.current?.focus(), 0);
  }

  async function fetchModels() {
    const year = yearValue ?? "";
    const make = makeValue ?? "";
    if (!isValidYear(year) || !make.trim()) return;

    if (
      modelsFetchedRef.current?.make === make &&
      modelsFetchedRef.current?.year === year
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/vehicle-models?make=${encodeURIComponent(make)}&year=${year}`
      );
      if (!res.ok) return;
      const { models } = await res.json();
      setModelSuggestions(models ?? []);
      modelsFetchedRef.current = { make, year };
    } catch {
      // Silent fail
    }
  }

  function handleModelFocus() {
    fetchModels();
    setShowModelDrop(true);
  }

  function handleModelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue("model", val, { shouldValidate: false });
    setModelFilter(val);
    setShowModelDrop(true);
  }

  function selectModel(model: string) {
    setValue("model", model, { shouldValidate: true });
    setModelFilter(model);
    setShowModelDrop(false);
    modelInputRef.current?.blur();
  }

  const filteredModels = modelFilter
    ? modelSuggestions.filter((m) =>
        m.toLowerCase().includes(modelFilter.toLowerCase())
      )
    : modelSuggestions;

  async function onSubmit(data: VehicleInfo) {
    setSubmitting(true);
    let bodyClass: VehicleBodyClass | undefined;
    try {
      const res = await fetch(
        `/api/vehicle-body-class?handle=${encodeURIComponent(businessHandle)}&make=${encodeURIComponent(data.make)}&model=${encodeURIComponent(data.model)}`
      );
      if (res.ok) {
        const json = await res.json();
        bodyClass = json.bodyClass ?? undefined;
      }
    } catch {
      // silent — proceed without body class, base price will be used
    }
    setVehicle({ ...data, bodyClass });
    setNavigationDirection("forward");
    router.push(
      bodyClass
        ? `/${businessHandle}/book/exterior`
        : `/${businessHandle}/book/vehicle-type`
    );
  }

  const { ref: makeRhfRef, ...makeRegisterRest } = register("make");
  const { ref: modelRhfRef, ...modelRegisterRest } = register("model");

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8 pt-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "var(--accent-light, #dbeafe)" }}
        >
          <Car
            className="w-7 h-7"
            style={{ color: "var(--accent, #2563eb)" }}
            strokeWidth={1.5}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          What&apos;s your vehicle?
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">
          We&apos;ll use this to make sure the right products are used for your car.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1.5">
            Year
          </label>
          <input
            id="year"
            type="text"
            inputMode="numeric"
            placeholder="2021"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={4}
            {...register("year")}
            className={`w-full h-12 px-4 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.year ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.year && (
            <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1.5">
            Make
          </label>
          <input
            id="make"
            type="text"
            placeholder="Toyota"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            {...makeRegisterRest}
            ref={(el) => {
              makeRhfRef(el);
              (makeInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            onChange={handleMakeChange}
            onBlur={() => setTimeout(() => setShowMakeDrop(false), 150)}
            onFocus={() => {
              if ((makeValue ?? "").length >= 1) {
                setMakeSuggestions(filterMakes(makeValue ?? ""));
                setShowMakeDrop(true);
              }
            }}
            className={`w-full h-12 px-4 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.make ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.make && (
            <p className="text-red-500 text-xs mt-1">{errors.make.message}</p>
          )}
          {showMakeDrop && makeSuggestions.length > 0 && (
            <ul className="dropdown-list absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg overflow-hidden">
              {makeSuggestions.map((make) => (
                <li key={make}>
                  <button
                    type="button"
                    onMouseDown={() => selectMake(make)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-blue-50 transition-colors"
                  >
                    {make}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1.5">
            Model
          </label>
          <input
            id="model"
            type="text"
            placeholder="Camry"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            {...modelRegisterRest}
            ref={(el) => {
              modelRhfRef(el);
              (modelInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            onChange={handleModelChange}
            onFocus={handleModelFocus}
            onBlur={() => setTimeout(() => setShowModelDrop(false), 150)}
            className={`w-full h-12 px-4 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.model ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.model && (
            <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>
          )}
          {showModelDrop && filteredModels.length > 0 && (
            <ul className="dropdown-list absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg overflow-hidden max-h-52 overflow-y-auto">
              {filteredModels.map((model) => (
                <li key={model}>
                  <button
                    type="button"
                    onMouseDown={() => selectModel(model)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-blue-50 transition-colors"
                  >
                    {model}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 text-white font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-70"
            style={{
              backgroundColor: "var(--accent, #2563eb)",
              borderRadius: "var(--ui-radius-lg, 1rem)",
            }}
          >
            {submitting ? "Checking vehicle…" : "Let’s pick your services"}
          </button>
        </div>
      </form>
    </div>
  );
}
