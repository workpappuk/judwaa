import { LmsTextField } from "@/components/lms/lms-text-field";

type ContactFormValues = {
  contactEmail: string;
  contactPhone: string;
};

type ContactFieldsProps = {
  values: ContactFormValues;
  onChange: (next: ContactFormValues) => void;
};

export function ContactFields({ values, onChange }: ContactFieldsProps) {
  return (
    <>
      <LmsTextField
        label="Contact Email"
        type="email"
        value={values.contactEmail}
        onChange={(contactEmail) => onChange({ ...values, contactEmail })}
        placeholder="ops@gamma.edu"
      />
      <LmsTextField
        label="Contact Phone"
        value={values.contactPhone}
        onChange={(contactPhone) => onChange({ ...values, contactPhone })}
        placeholder="+91-9000000000"
      />
    </>
  );
}
