import React from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
type InputProps = React.ComponentProps<typeof Input>;
import { Textarea } from '../../../components/ui/textarea';
import type { TextareaProps } from '../../../components/ui/textarea';
import { Select, type SelectProps } from '../../../components/ui/select';

// Custom Input Component
const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, onChange, ...props }, ref) => (
    <div className="space-y-1">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500">*</span>}
      </label>
      <Input
        ref={ref}
        {...props}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  )
);
CustomInput.displayName = 'CustomInput';

// Custom Select Component
const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ label, options, onChange, ...props }, ref) => (
    <div className="space-y-1">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500">*</span>}
      </label>
      <Select
        ref={ref}
        {...props}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      >
        {options.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  )
);
CustomSelect.displayName = 'CustomSelect';

// Custom Textarea Component
const CustomTextarea = React.forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ label, onChange, ...props }, ref) => (
    <div className="space-y-1">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Textarea
        ref={ref}
        {...props}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
    </div>
  )
);
CustomTextarea.displayName = 'CustomTextarea';

// Extend the HTML input props to include our custom props
interface CustomInputProps extends Omit<InputProps, 'onChange'> {
  label: string;
  onChange: (value: string) => void;
}

interface CustomSelectProps extends Omit<SelectProps, 'onChange'> {
  label: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface CustomTextareaProps extends Omit<TextareaProps, 'onChange'> {
  label: string;
  onChange: (value: string) => void;
}

import type { AdminTeam, SeriesFormData } from '../../../types/admin';

type Team = AdminTeam; // For backward compatibility

interface SeriesFormProps {
  formData: SeriesFormData;
  setFormData: React.Dispatch<React.SetStateAction<SeriesFormData>>;
  teams: Team[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onDelete?: (id: string) => void;
  loading: boolean;
  selectedSeriesId: string | null;
}

export const SeriesForm: React.FC<SeriesFormProps> = ({
  formData,
  setFormData,
  teams,
  onSubmit,
  onDelete,
  loading,
  selectedSeriesId,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          id="name"
          label="Series Name"
          value={formData.name}
          onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          required
        />
        <CustomInput
          id="shortName"
          label="Short Name"
          value={formData.shortName}
          onChange={(value) => setFormData(prev => ({ ...prev, shortName: value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          id="startDate"
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
          required
        />
        <CustomInput
          id="endDate"
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
          min={formData.startDate}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomSelect
          id="matchType"
          label="Match Type"
          value={formData.matchType}
          onChange={(value) => setFormData(prev => ({ ...prev, matchType: value }))}
          options={[
            { value: 'T20', label: 'T20' },
            { value: 'ODI', label: 'ODI' },
            { value: 'TEST', label: 'Test' },
            { value: 'T10', label: 'T10' },
            { value: 'OTHER', label: 'Other' },
          ]}
          required
        />
        <CustomSelect
          id="gender"
          label="Gender"
          value={formData.gender}
          onChange={(value) => setFormData((prev) => ({ ...prev, gender: value as 'MALE' | 'FEMALE' | 'MIXED' }))}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'MIXED', label: 'Mixed' },
          ]}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teams</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center">
              <input
                type="checkbox"
                id={`team-${team.id}`}
                checked={formData.teamIds.includes(team.id)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const teamIds = e.target.checked
                    ? [...formData.teamIds, team.id]
                    : formData.teamIds.filter((id) => id !== team.id);
                  setFormData((prev) => ({ ...prev, teamIds }));
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`team-${team.id}`} className="ml-2 block text-sm text-gray-700">
                {team.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <CustomTextarea
        id="description"
        label="Description"
        value={formData.description}
        onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
        placeholder="Enter series description"
      />

      <div className="flex justify-end space-x-2">
        {selectedSeriesId && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete?.(selectedSeriesId)}
            disabled={loading}
          >
            Delete Series
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : selectedSeriesId ? 'Update Series' : 'Create Series'}
        </Button>
      </div>
    </form>
  );
};
