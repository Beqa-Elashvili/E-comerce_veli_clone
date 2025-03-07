import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
  placeHolder: string;
}

const Input: React.FC<InputProps> = ({
  id,
  required,
  type,
  placeHolder,
  register,
  errors,
  disabled,
}) => {
  return (
    <div>
      <input
        id={id}
        autoComplete={id}
        placeholder={placeHolder}
        disabled={disabled}
        type={type}
        {...register(id, { required })}
        className={` ${errors[id] && "focus:ring-rose-500"}  ${
          disabled && "opacity-50 cursor-default"
        }
           px-2 py-2 w-full ring-1 font-semibold rounded-md focus:outline-none focus:ring-2 hover:ring-cyan-400 transition duration-300 `}
      />
    </div>
  );
};

export default Input;
