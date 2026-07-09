import { LmsTextField } from "@/components/lms/lms-text-field";

type AddressFormValues = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
};

type AddressFieldsProps = {
  values: AddressFormValues;
  onChange: (next: AddressFormValues) => void;
};

export function AddressFields({ values, onChange }: AddressFieldsProps) {
  return (
    <>
      <LmsTextField
        label="Address Line 1"
        value={values.addressLine1}
        onChange={(addressLine1) => onChange({ ...values, addressLine1 })}
        placeholder="12 Learning Street"
      />
      <LmsTextField
        label="Address Line 2"
        value={values.addressLine2}
        onChange={(addressLine2) => onChange({ ...values, addressLine2 })}
        placeholder="Near City Mall"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <LmsTextField
          label="City"
          value={values.city}
          onChange={(city) => onChange({ ...values, city })}
          placeholder="Mumbai"
        />
        <LmsTextField
          label="State"
          value={values.state}
          onChange={(state) => onChange({ ...values, state })}
          placeholder="Maharashtra"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <LmsTextField
          label="Country"
          value={values.country}
          onChange={(country) => onChange({ ...values, country })}
          placeholder="India"
        />
        <LmsTextField
          label="Pincode"
          value={values.pincode}
          onChange={(pincode) => onChange({ ...values, pincode })}
          placeholder="400001"
        />
      </div>
    </>
  );
}
