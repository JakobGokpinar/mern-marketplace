import { useState, useCallback } from 'react';
import type { ZodSchema, ZodIssue } from 'zod';

type FieldErrors = Record<string, string>;

export const useFormValidation = <T>(schema: ZodSchema<T>) => {
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = useCallback((data: unknown): data is T => {
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FieldErrors = {};
    result.error.issues.forEach((issue: ZodIssue) => {
      const field = issue.path.join('.');
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    setErrors(fieldErrors);
    return false;
  }, [schema]);

  const clearErrors = useCallback(() => setErrors({}), []);
  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  return { errors, validate, clearErrors, setFieldError };
};
