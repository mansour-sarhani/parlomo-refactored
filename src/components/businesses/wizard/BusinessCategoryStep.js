"use client";

import { useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    setBusinessWizardDraft,
} from "@/features/businesses/businessWizardSlice";
import { fetchBusinessCategoryOptions } from "@/features/businesses/businessCategoriesSlice";
import { Button } from "@/components/common/Button";
import { SelectField } from "@/components/forms";
import { buildCategoryOptions } from "@/features/businesses/components/utils";

const validationSchema = Yup.object({
    categoryId: Yup.string().required("Please choose a category"),
    subCategoryId: Yup.string().nullable(),
});

export default function BusinessCategoryStep() {
    const dispatch = useAppDispatch();
    const { options, optionsLoading } = useAppSelector((state) => state.businessCategories);
    const draft = useAppSelector((state) => state.businessWizard.draft);

    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (options.length === 0 && !optionsLoading) {
            dispatch(fetchBusinessCategoryOptions());
        }
    }, [dispatch, options.length, optionsLoading]);

    const categoryMap = useMemo(() => {
        const map = new Map();
        const traverse = (nodes = []) => {
            nodes.forEach((node) => {
                if (!node) return;
                map.set(String(node.id), node);
                if (Array.isArray(node.children)) {
                    traverse(node.children);
                }
            });
        };
        traverse(options);
        return map;
    }, [options]);

    useEffect(() => {
        if (draft.categoryId) {
            setSelectedCategory(categoryMap.get(String(draft.categoryId)) || null);
        }
    }, [draft.categoryId, categoryMap]);

    const categoryOptions = useMemo(
        () => buildCategoryOptions(options),
        [options]
    );

    const childOptions = useMemo(() => {
        if (!selectedCategory || !Array.isArray(selectedCategory.children)) {
            return [];
        }
        return selectedCategory.children.map((child) => ({
            value: String(child.id),
            label: child.title || `ID ${child.id}`,
        }));
    }, [selectedCategory]);

    // Debug: Log draft data for this step
    useEffect(() => {
        console.log("[BusinessCategoryStep] Draft data:", draft);
        console.log("[BusinessCategoryStep] CategoryId:", draft.categoryId);
        console.log("[BusinessCategoryStep] SubCategoryId:", draft.subCategoryId);
    }, [draft]);

    return (
        <Formik
            initialValues={{
                categoryId: draft.categoryId ? String(draft.categoryId) : "",
                subCategoryId: draft.subCategoryId ? String(draft.subCategoryId) : "",
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={(values) => {
                const category = categoryMap.get(values.categoryId) || null;
                const subCategory = category && values.subCategoryId
                    ? (category.children || []).find((child) => String(child.id) === values.subCategoryId)
                    : null;

                dispatch(
                    setBusinessWizardDraft({
                        ...draft,
                        categoryId: values.categoryId,
                        categoryParentId: category?.parent_id || "",
                        categoryName: category?.title || "",
                        subCategoryId: values.subCategoryId || "",
                        subCategoryName: subCategory?.title || "",
                    })
                );
                dispatch(nextBusinessWizardStep());
            }}
        >
            {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <SelectField
                            name="categoryId"
                            label="Primary category"
                            required
                            disabled={optionsLoading}
                            value={values.categoryId}
                            onChange={(event) => {
                                const newValue = event.target.value;
                                setFieldValue("categoryId", newValue);
                                setFieldValue("subCategoryId", "");
                                setSelectedCategory(categoryMap.get(newValue) || null);
                            }}
                        >
                            <option value="">Select category</option>
                            {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            name="subCategoryId"
                            label="Sub-category"
                            disabled={!childOptions.length}
                            value={values.subCategoryId}
                            onChange={(event) => setFieldValue("subCategoryId", event.target.value)}
                        >
                            <option value="">No sub-category</option>
                            {childOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => dispatch(prevBusinessWizardStep())}
                        >
                            Back
                        </Button>
                        <Button type="submit">
                            Continue
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}


