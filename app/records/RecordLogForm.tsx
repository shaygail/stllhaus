"use client";

import {
  COMPLIANCE_FORM_LABELS,
  COMPLIANCE_FORM_TYPES,
  type ComplianceFormType,
  serializeComplianceForm,
} from "@/lib/compliance-forms";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FOOD_SAFETY_AREAS = [
  "Staff competencies/training",
  "Temperature control",
  "Cleaning/sanitising",
  "Separation",
  "Hand hygiene",
] as const;

export function RecordLogForm() {
  const router = useRouter();
  const [formType, setFormType] = useState<ComplianceFormType>("allergens");
  const [loggedAt, setLoggedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [enteredBy, setEnteredBy] = useState("");

  const [dishName, setDishName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");

  const [staffName, setStaffName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [dateBecameSick, setDateBecameSick] = useState("");
  const [dateReturned, setDateReturned] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [checkedBy, setCheckedBy] = useState("");

  const [weekStart, setWeekStart] = useState("");
  const [fridgeName, setFridgeName] = useState("");
  const [tempMon, setTempMon] = useState("");
  const [tempTue, setTempTue] = useState("");
  const [tempWed, setTempWed] = useState("");
  const [tempThu, setTempThu] = useState("");
  const [tempFri, setTempFri] = useState("");
  const [tempSat, setTempSat] = useState("");
  const [tempSun, setTempSun] = useState("");
  const [tempTaskDoneBy, setTempTaskDoneBy] = useState("");

  const [deliveryDate, setDeliveryDate] = useState("");
  const [batchLotId, setBatchLotId] = useState("");
  const [supplierDetails, setSupplierDetails] = useState("");
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [deliveryTemp, setDeliveryTemp] = useState("");
  const [deliveryTaskDoneBy, setDeliveryTaskDoneBy] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [siteRegistrationNumber, setSiteRegistrationNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [dayToPlaceOrders, setDayToPlaceOrders] = useState("");
  const [daysToReceiveDelivery, setDaysToReceiveDelivery] = useState("");
  const [goodsSupplied, setGoodsSupplied] = useState("");
  const [supplierComments, setSupplierComments] = useState("");
  const [foodSafetyArea, setFoodSafetyArea] = useState<string>(FOOD_SAFETY_AREAS[0]);
  const [finding, setFinding] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Compliant");

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    if (!enteredBy.trim() || !loggedAt.trim()) {
      setStatus("error");
      setError("Please fill all required fields.");
      return;
    }

    let payload: Record<string, unknown> = {};
    let title = COMPLIANCE_FORM_LABELS[formType];

    if (formType === "allergens") {
      if (!dishName.trim()) {
        setStatus("error");
        setError("Dish name is required.");
        return;
      }
      payload = { dishName, ingredients, allergens };
      title = `${COMPLIANCE_FORM_LABELS.allergens} - ${dishName.trim()}`;
    } else if (formType === "staff_sickness") {
      if (!staffName.trim()) {
        setStatus("error");
        setError("Staff name is required.");
        return;
      }
      payload = { staffName, symptoms, dateBecameSick, dateReturned, actionTaken, checkedBy };
      title = `${COMPLIANCE_FORM_LABELS.staff_sickness} - ${staffName.trim()}`;
    } else if (formType === "fridge_temp_check") {
      payload = {
        weekStart,
        fridgeName,
        temperatures: { mon: tempMon, tue: tempTue, wed: tempWed, thu: tempThu, fri: tempFri, sat: tempSat, sun: tempSun },
        taskDoneBy: tempTaskDoneBy,
      };
      title = `${COMPLIANCE_FORM_LABELS.fridge_temp_check} - ${fridgeName.trim() || "Entry"}`;
    } else if (formType === "trusted_supplier_delivery") {
      payload = { deliveryDate, batchLotId, supplierDetails, foodType, quantity, temperature: deliveryTemp, taskDoneBy: deliveryTaskDoneBy };
      title = `${COMPLIANCE_FORM_LABELS.trusted_supplier_delivery} - ${foodType.trim() || "Entry"}`;
    } else if (formType === "trusted_suppliers") {
      if (!businessName.trim()) {
        setStatus("error");
        setError("Business name is required.");
        return;
      }
      payload = {
        businessName,
        siteRegistrationNumber,
        contactPerson,
        phone: supplierPhone,
        email: supplierEmail,
        address: supplierAddress,
        dayToPlaceOrders,
        daysToReceiveDelivery,
        goodsSupplied,
        comments: supplierComments,
      };
      title = `${COMPLIANCE_FORM_LABELS.trusted_suppliers} - ${businessName.trim()}`;
    } else if (formType === "food_safety_area_review") {
      if (!foodSafetyArea.trim()) {
        setStatus("error");
        setError("Food safety area is required.");
        return;
      }
      payload = {
        foodSafetyArea,
        reviewStatus,
        finding: finding.trim(),
        correctiveAction: correctiveAction.trim(),
      };
      title = `${COMPLIANCE_FORM_LABELS.food_safety_area_review} - ${foodSafetyArea}`;
    }

    try {
      const details = serializeComplianceForm(formType, payload);

      const res = await fetch("/api/business-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_type: "compliance",
          title,
          details,
          entered_by: enteredBy.trim(),
          logged_at: new Date(loggedAt).toISOString(),
          amount: null,
          reference_id: null,
          attachments: null,
          tags: ["compliance_form", formType],
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Unable to save log");
      }

      router.push("/records");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to save log");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Form Type</span>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value as ComplianceFormType)}
            className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
          >
            {COMPLIANCE_FORM_TYPES.map((type) => (
              <option key={type} value={type}>
                {COMPLIANCE_FORM_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Date</span>
          <input
            type="date"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
            className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Entered By</span>
        <input
          type="text"
          value={enteredBy}
          onChange={(e) => setEnteredBy(e.target.value)}
          className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
          placeholder="Staff or supervisor name"
          required
        />
      </label>

      {formType === "allergens" && (
        <div className="space-y-4">
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Dish Name</span>
            <input type="text" value={dishName} onChange={(e) => setDishName(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" required />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Ingredients</span>
            <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={3} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Allergens</span>
            <textarea value={allergens} onChange={(e) => setAllergens(e.target.value)} rows={2} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" />
          </label>
        </div>
      )}

      {formType === "staff_sickness" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Staff Name</span><input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" required /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Symptoms</span><input type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Date Became Sick</span><input type="date" value={dateBecameSick} onChange={(e) => setDateBecameSick(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Date Returned to Work</span><input type="date" value={dateReturned} onChange={(e) => setDateReturned(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block sm:col-span-2"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Action Taken</span><input type="text" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block sm:col-span-2"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Checked By</span><input type="text" value={checkedBy} onChange={(e) => setCheckedBy(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
        </div>
      )}

      {formType === "fridge_temp_check" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Week Start</span><input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Fridge/Chiller</span><input type="text" value={fridgeName} onChange={(e) => setFridgeName(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Mon (°C)</span><input type="text" value={tempMon} onChange={(e) => setTempMon(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Tue (°C)</span><input type="text" value={tempTue} onChange={(e) => setTempTue(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Wed (°C)</span><input type="text" value={tempWed} onChange={(e) => setTempWed(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Thu (°C)</span><input type="text" value={tempThu} onChange={(e) => setTempThu(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Fri (°C)</span><input type="text" value={tempFri} onChange={(e) => setTempFri(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Sat (°C)</span><input type="text" value={tempSat} onChange={(e) => setTempSat(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Sun (°C)</span><input type="text" value={tempSun} onChange={(e) => setTempSun(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block sm:col-span-2"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Task Done By</span><input type="text" value={tempTaskDoneBy} onChange={(e) => setTempTaskDoneBy(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
        </div>
      )}

      {formType === "trusted_supplier_delivery" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Date</span><input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Batch/Lot ID</span><input type="text" value={batchLotId} onChange={(e) => setBatchLotId(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block sm:col-span-2"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Supplier Details</span><textarea value={supplierDetails} onChange={(e) => setSupplierDetails(e.target.value)} rows={2} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Type of Food</span><input type="text" value={foodType} onChange={(e) => setFoodType(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Quantity</span><input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Temperature</span><input type="text" value={deliveryTemp} onChange={(e) => setDeliveryTemp(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Task Done By</span><input type="text" value={deliveryTaskDoneBy} onChange={(e) => setDeliveryTaskDoneBy(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
        </div>
      )}

      {formType === "trusted_suppliers" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Business Name</span><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" required /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Site Registration Number</span><input type="text" value={siteRegistrationNumber} onChange={(e) => setSiteRegistrationNumber(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Contact Person</span><input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Phone</span><input type="text" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Email</span><input type="email" value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Address</span><input type="text" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Day to Place Orders</span><input type="text" value={dayToPlaceOrders} onChange={(e) => setDayToPlaceOrders(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Days to Receive Delivery</span><input type="text" value={daysToReceiveDelivery} onChange={(e) => setDaysToReceiveDelivery(e.target.value)} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block sm:col-span-2"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Goods Supplied</span><textarea value={goodsSupplied} onChange={(e) => setGoodsSupplied(e.target.value)} rows={2} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
          <label className="block sm:col-span-2"><span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Comments</span><textarea value={supplierComments} onChange={(e) => setSupplierComments(e.target.value)} rows={3} className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm" /></label>
        </div>
      )}

      {formType === "food_safety_area_review" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Food safety area</span>
            <select
              value={foodSafetyArea}
              onChange={(e) => setFoodSafetyArea(e.target.value)}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
            >
              {FOOD_SAFETY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Status</span>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
            >
              <option>Compliant</option>
              <option>Needs Improvement</option>
              <option>Non-compliant</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Finding / observation</span>
            <textarea
              value={finding}
              onChange={(e) => setFinding(e.target.value)}
              rows={3}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
              placeholder="What was checked and what was found?"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Corrective action</span>
            <textarea
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              rows={3}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
              placeholder="Action taken or next steps"
            />
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50"
      >
        {status === "saving" ? "Saving..." : "Save Form Entry"}
      </button>

      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
