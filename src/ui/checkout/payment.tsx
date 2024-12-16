"use client";

import { clearCartCookieAction } from "@/actions/cart-actions";
import { useTranslations } from "@/i18n/client";
import { useDebouncedValue } from "@/lib/hooks";
import { saveBillingAddressAction, saveShippingRateAction } from "@/ui/checkout/checkout-actions";
import { type AddressSchema, getAddressSchema } from "@/ui/checkout/checkout-form-schema";
import { ShippingRatesSection } from "@/ui/checkout/shipping-rates-section";
import { saveTaxIdAction } from "@/ui/checkout/tax-action";
import { useDidUpdate } from "@/ui/hooks/lifecycle";
import { InputWithErrors } from "@/ui/input-errors";
import { Alert, AlertDescription, AlertTitle } from "@/ui/shadcn/alert";
import { Button } from "@/ui/shadcn/button";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Collapsible, CollapsibleContent } from "@/ui/shadcn/collapsible";
import { Label } from "@/ui/shadcn/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEventHandler, useState, useTransition } from "react";
import { AddressElement } from "@stripe/react-stripe-js";
import type * as Commerce from "commerce-kit";

export const Payment = ({
	shippingRateId,
	shippingRates,
	allProductsDigital,
	locale,
}: {
	shippingRateId?: string | null;
	shippingRates: Commerce.MappedShippingRate[];
	allProductsDigital: boolean;
	locale: string;
}) => {
	return (
		<PaymentForm
			locale={locale}
			shippingRates={shippingRates}
			cartShippingRateId={shippingRateId ?? null}
			allProductsDigital={allProductsDigital}
		/>
	);
};

const PaymentForm = ({
	shippingRates,
	cartShippingRateId,
	allProductsDigital,
	locale,
}: {
	shippingRates: Commerce.MappedShippingRate[];
	cartShippingRateId: string | null;
	allProductsDigital: boolean;
	locale: string;
}) => {
	const t = useTranslations("/cart.page.payment");

	const ft = useTranslations("/cart.page.formErrors");
	const addressSchema = getAddressSchema({
		cityRequired: ft("cityRequired"),
		countryRequired: ft("countryRequired"),
		line1Required: ft("line1Required"),
		nameRequired: ft("nameRequired"),
		postalCodeRequired: ft("postalCodeRequired"),
	});

	const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<
		Partial<Record<keyof AddressSchema, string[] | null | undefined>>
	>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isTransitioning, transition] = useTransition();
	const [isAddressReady, setIsAddressReady] = useState(false);
	const [billingAddressValues, setBillingAddressValues] = useState<AddressSchema>({
		name: "",
		city: "",
		country: "",
		line1: "",
		line2: "",
		postalCode: "",
		state: "",
		phone: "",
		taxId: "",
		email: "",
	});

	const [isBillingAddressPending, debouncedBillingAddress] = useDebouncedValue(billingAddressValues, 1000);
	const [shippingRateId, setShippingRateId] = useState<string | null>(cartShippingRateId);

	const [sameAsShipping, setSameAsShipping] = useState(true);

	const router = useRouter();

	useDidUpdate(() => {
		transition(async () => {
			await saveBillingAddressAction({ billingAddress: debouncedBillingAddress });
			router.refresh();
		});
	}, [debouncedBillingAddress, router]);

	const readyToRender = isAddressReady;

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();

		const shippingAddress: Partial<AddressSchema> = {
			name: billingAddressValues.name,
			city: billingAddressValues.city,
			country: billingAddressValues.country,
			line1: billingAddressValues.line1,
			line2: billingAddressValues.line2 ?? "",
			postalCode: billingAddressValues.postalCode,
			state: billingAddressValues.state ?? "",
			phone: billingAddressValues.phone ?? "",
		};

		const billingAddress: Partial<AddressSchema> = sameAsShipping ? shippingAddress : billingAddressValues;

		const validatedBillingAddress = addressSchema.safeParse(billingAddress);
		const validatedShippingAddress = addressSchema.safeParse(shippingAddress);

		if (!validatedBillingAddress.success && !sameAsShipping) {
			setFieldErrors(validatedBillingAddress.error?.flatten().fieldErrors ?? {});
		} else {
			setFieldErrors({});
		}

		if (!validatedShippingAddress.success || !validatedBillingAddress.success) {
			console.error("Validation failed", {
				validatedShippingAddress,
				validatedBillingAddress,
			});
			setFormErrorMessage(t("fillRequiredFields"));
			return;
		}

		setIsLoading(true);
		if (validatedBillingAddress.data.taxId) {
			await saveTaxIdAction({
				taxId: validatedBillingAddress.data.taxId,
			});
		}

		// Simulate payment processing via custom backend
		try {
			// Replace this with your custom payment logic (e.g., your payment API call)
			const paymentResult = await customPaymentProcessor({
				billingAddress: validatedBillingAddress.data,
				shippingAddress: validatedShippingAddress.data,
			});

			if (paymentResult.success) {
				await clearCartCookieAction();
				router.push("/order/success");
			} else {
				setFormErrorMessage(paymentResult.errorMessage ?? t("unexpectedError"));
			}
		} catch (error) {
			setFormErrorMessage(error instanceof Error ? error.message : t("unexpectedError"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="grid gap-4">
			<AddressElement
				options={{
					mode: "shipping",
					fields: { phone: "always" },
					validation: { phone: { required: "auto" } },
				}}
				onChange={(e) => {
					if (!sameAsShipping) return;

					if (!isAddressReady) return;

					setBillingAddressValues({
						name: e.value.name,
						city: e.value.address.city,
						country: e.value.address.country,
						line1: e.value.address.line1,
						line2: e.value.address.line2 ?? null,
						postalCode: e.value.address.postal_code,
						state: e.value.address.state ?? null,
						phone: e.value.phone ?? null,
						taxId: "",
						email: "",
					});
				}}
				onReady={() => setIsAddressReady(true)}
			/>

			{readyToRender && !allProductsDigital && (
				<ShippingRatesSection
					locale={locale}
					onChange={(value) => {
						transition(async () => {
							setShippingRateId(value);
							await saveShippingRateAction({ shippingRateId: value });
							router.refresh();
						});
					}}
					value={shippingRateId}
					shippingRates={shippingRates}
				/>
			)}

			{readyToRender && (
				<Label
					className="flex flex-row items-center gap-x-2"
					aria-controls="billingAddressCollapsibleContent"
					aria-expanded={!sameAsShipping}
				>
					<Checkbox
						onCheckedChange={(checked) => {
							setSameAsShipping(checked === true);
						}}
						checked={sameAsShipping}
						name="sameAsShipping"
						value={sameAsShipping ? "true" : "false"}
					/>
					{allProductsDigital ? t("billingSameAsPayment") : t("billingSameAsShipping")}
				</Label>
			)}

			{readyToRender && (
				<Collapsible className="" open={!sameAsShipping}>
					<CollapsibleContent id="billingAddressCollapsibleContent" className="CollapsibleContent">
						<fieldset
							aria-hidden={sameAsShipping}
							tabIndex={sameAsShipping ? -1 : undefined}
							className={`grid gap-6 rounded-lg border p-4`}
						>
							<legend className="-ml-1 whitespace-nowrap px-1 text-sm font-medium">
								{t("billingAddressTitle")}
							</legend>
							<BillingAddressSection
								values={billingAddressValues}
								onChange={setBillingAddressValues}
								errors={fieldErrors}
							/>
						</fieldset>
					</CollapsibleContent>
				</Collapsible>
			)}

			{formErrorMessage && (
				<Alert variant="destructive" className="mt-2" aria-live="polite" aria-atomic>
					<AlertCircle className="-mt-1 h-4 w-4" />
					<AlertTitle>{t("errorTitle")}</AlertTitle>
					<AlertDescription>{formErrorMessage}</AlertDescription>
				</Alert>
			)}

			{readyToRender && (
				<Button
					type="submit"
					className="w-full rounded-full text-lg"
					size="lg"
					aria-disabled={isBillingAddressPending || isLoading || isTransitioning}
					onClick={(e) => {
						if (isBillingAddressPending || isLoading || isTransitioning) {
							e.preventDefault();
						}
					}}
				>
					{isBillingAddressPending || isLoading || isTransitioning ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						t("payNowButton")
					)}
				</Button>
			)}
		</form>
	);
};

const BillingAddressSection = ({
	values,
	onChange,
	errors,
}: {
	values: AddressSchema;
	onChange: (values: AddressSchema) => void;
	errors: Record<string, string[] | null | undefined>; // Make sure errors is passed as a Record
}) => {
	const t = useTranslations("/cart.page.payment");
	const onFieldChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.currentTarget;
		onChange({ ...values, [name]: value });
	};

	return (
		<div className="grid gap-4">
			<InputWithErrors
				label={t("fullName")}
				name="name"
				type="text"
				value={values.name}
				onChange={onFieldChange}
				errors={errors} // Pass the whole errors object here
			/>

			<InputWithErrors
				label={t("phone")}
				name="phone"
				type="tel"
				value={values.phone ?? ""} // Make sure the value matches the correct field
				onChange={onFieldChange}
				errors={errors} // Pass the whole errors object here
			/>
		</div>
	);
};

async function customPaymentProcessor({
	billingAddress,
	shippingAddress,
}: {
	billingAddress: Partial<AddressSchema>;
	shippingAddress: Partial<AddressSchema>;
}): Promise<{
	success: boolean;
	orderId?: string;
	errorMessage?: string;
}> {
	try {
		// Prepare the payment data
		const paymentData = {
			billing_address: billingAddress,
			shipping_address: shippingAddress,
			amount: 100.0, //sample
		};

		// Define payment responses for success and failure
		const successResponse = {
			success: true,
			orderId: "ORDER12345", // Simulated order ID
		};

		const failureResponse = {
			success: false,
			errorMessage: "Payment failed due to insufficient funds or network error",
		};

		const isPaymentSuccessful = Math.random() > 0.5; // // Replace this with an API call

		const paymentResponse = isPaymentSuccessful ? successResponse : failureResponse;

		return paymentResponse;
	} catch (error) {
		// In case of unexpected error
		return {
			success: false,
			errorMessage: error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}
