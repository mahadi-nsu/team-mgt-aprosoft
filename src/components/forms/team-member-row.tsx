"use client";

interface Member {
  name: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  contactNo: string;
}

interface TeamMemberRowProps {
  member: Member;
  index: number;
  onChange: (index: number, field: keyof Member, value: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function TeamMemberRow({
  member,
  index,
  onChange,
  onRemove,
  disabled = false,
}: TeamMemberRowProps) {
  return (
    <tr>
      <td>
        <input
          type="text"
          className="form-control"
          value={member.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          placeholder="Enter member name"
          disabled={disabled}
        />
      </td>
      <td>
        <select
          className="form-select"
          value={member.gender}
          onChange={(e) => onChange(index, "gender", e.target.value)}
          disabled={disabled}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </td>
      <td>
        <input
          type="date"
          className="form-control"
          value={member.dateOfBirth}
          onChange={(e) => onChange(index, "dateOfBirth", e.target.value)}
          disabled={disabled}
        />
      </td>
      <td>
        <input
          type="text"
          className="form-control"
          value={member.contactNo}
          onChange={(e) => onChange(index, "contactNo", e.target.value)}
          placeholder="Number only"
          disabled={disabled}
        />
      </td>
      <td>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => onRemove(index)}
          disabled={disabled}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
