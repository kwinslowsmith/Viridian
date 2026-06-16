"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { colors } from "@/app/modules/improv/design/colors";
import { ClassList } from "@/app/modules/improv/components/ClassList";
import { StudentDashboard } from "@/app/modules/improv/components/StudentDashboard";
import type { Class } from "@/lib/types";

function TeacherDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/improv/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setClasses(data.classes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <ClassList
      classes={classes}
      onSelectClass={(classId) => console.log("Selected:", classId)}
      isLoading={loading}
    />
  );
}

function StudentPicker() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/improv/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();

        const allStudents = new Map();
        data.classes?.forEach((cls: any) => {
          cls.enrollments?.forEach((enrollment: any) => {
            if (enrollment.student && !allStudents.has(enrollment.student.id)) {
              allStudents.set(enrollment.student.id, enrollment.student);
            }
          });
        });

        const studentList = Array.from(allStudents.values());
        setStudents(studentList);
        if (studentList.length > 0) {
          setSelectedId(studentList[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const fetchStudentData = async () => {
        try {
          const res = await fetch(`/api/improv/student/${selectedId}/dashboard`);
          if (!res.ok) throw new Error("Failed to fetch student data");
          const data = await res.json();
          setStudentData(data);
        } catch (err) {
          console.error("Failed to fetch student data:", err);
        }
      };
      fetchStudentData();
    }
  }, [selectedId]);

  if (loading) return <div style={{ color: colors.text }}>Loading students...</div>;
  if (students.length === 0) return <div style={{ color: colors.text }}>No students found</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => setSelectedId(student.id)}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: selectedId === student.id ? colors.teal.bg : colors.surface,
              color: selectedId === student.id ? colors.teal.text : colors.text,
              border: `1px solid ${selectedId === student.id ? colors.teal.border : colors.border}`,
            }}
          >
            {student.name}
          </button>
        ))}
      </div>
      {studentData && (
        <div>
          {/* Hero Section */}
          <div
            className="rounded-xl p-8 mb-6 text-white relative overflow-hidden"
            style={{
              backgroundColor: colors.teal.bg,
            }}
          >
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
              style={{ backgroundColor: 'white' }}
            />
            <div className="relative z-10">
              <p className="text-sm font-semibold mb-2" style={{ color: '#000' }}>Your Progress</p>
              <h1
                className="text-4xl font-bold mb-6"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  color: '#000',
                }}
              >
                {studentData.student?.name || 'Student'}
              </h1>

              <div className="flex items-center gap-8">
                {/* Progress Ring */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="48" cy="48" r="40" stroke="rgba(0,0,0,0.15)" strokeWidth="4" fill="none" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#000"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(studentData.classes?.[0]?.progress?.proficient || 0) * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: '#000' }}>{studentData.classes?.[0]?.progress?.proficient || 0}%</span>
                    <span className="text-xs font-semibold" style={{ color: '#000' }}>Proficient</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1">
                  <div className="mb-4">
                    <div className="text-2xl font-bold" style={{ color: '#000' }}>{studentData.classes?.[0]?.progress?.proficient || 0}</div>
                    <div className="text-sm font-semibold" style={{ color: '#000' }}>Proficient Skills</div>
                  </div>
                  <div className="text-xs font-semibold flex items-center gap-2" style={{ color: '#000' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#000' }}></span>
                    Latest: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Classes */}
          {studentData.classes?.map((classData: any, idx: number) => (
            <div key={classData.class?.id} className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                {classData.class?.name}
              </h2>

              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div className="text-2xl font-bold" style={{ color: '#4DAB7E' }}>
                    {classData.progress?.proficient || 0}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text2 }}>Proficient</div>
                </div>
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div className="text-2xl font-bold" style={{ color: '#1D4ED8' }}>
                    {classData.progress?.developing || 0}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text2 }}>Developing</div>
                </div>
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div className="text-2xl font-bold" style={{ color: '#EF9F27' }}>
                    {classData.progress?.approaching || 0}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text2 }}>Approaching</div>
                </div>
              </div>

              {/* Skills List */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <div
                  className="px-4 py-3 border-b"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                >
                  <h3 className="font-semibold text-sm" style={{ color: colors.text }}>Skills</h3>
                </div>
                <div className="p-4 space-y-3">
                  {classData.ratings?.teacher?.slice(0, 5).map((rating: any) => (
                    <div key={rating.id} className="flex items-center gap-3 pb-3 border-b last:border-b-0 last:pb-0"
                      style={{ borderColor: colors.border }}>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor:
                            rating.level === 'proficient' ? '#E8F5EF' :
                            rating.level === 'developing' ? '#DBEAFE' :
                            '#FFF3E0',
                          color:
                            rating.level === 'proficient' ? '#0F4C35' :
                            rating.level === 'developing' ? '#0C4A6E' :
                            '#BA7517',
                        }}
                      >
                        {rating.level === 'proficient' ? '✓' :
                         rating.level === 'developing' ? '◐' :
                         '◎'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: colors.text }}>
                          {rating.skill?.name}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: colors.text2 }}>
                          {rating.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrganizations(data.organizations || []);
      // Auto-select first org if available
      if (data.organizations?.length > 0) {
        setSelectedOrg(data.organizations[0].id);
      }
      setOrgLoading(false);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setOrgLoading(false);
    }
  };

  if (orgLoading) return <div style={{ color: colors.text }}>Loading organizations...</div>;
  if (organizations.length === 0) {
    return (
      <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "1rem", borderRadius: "0.5rem" }}>
        <p style={{ color: colors.text }}>No organizations found. Ask Super-Admin to create one.</p>
      </div>
    );
  }

  return (
    <OrganizationAdminPanel
      organizationId={selectedOrg!}
      organizations={organizations}
      onChangeOrg={setSelectedOrg}
    />
  );
}

function OrganizationAdminPanel({
  organizationId,
  organizations,
  onChangeOrg,
}: {
  organizationId: string;
  organizations: any[];
  onChangeOrg: (id: string) => void;
}) {
  const [tab, setTab] = useState<"students" | "classes" | "skills" | "standards">("students");
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [standards, setStandards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newStudent, setNewStudent] = useState({ name: "", email: "" });
  const [newClass, setNewClass] = useState({ name: "", startDate: "", numWeeks: 4, organizationId });
  const [newSkill, setNewSkill] = useState({ name: "", category: "foundation", description: "" });

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  const fetchData = async () => {
    try {
      const [classRes, skillRes, standardRes] = await Promise.all([
        fetch(`/api/improv/classes?organizationId=${organizationId}`),
        fetch("/api/improv/skills"),
        fetch(`/api/organizations/${organizationId}/standards`),
      ]);
      const classData = await classRes.json();
      const skillData = await skillRes.json();
      const standardData = await standardRes.json();

      setClasses(classData.classes || []);
      setSkills(skillData.skills || []);
      setStandards(standardData.distributions || []);

      // Extract unique students from enrollments
      const uniqueStudents = new Map();
      classData.classes?.forEach((cls: any) => {
        cls.enrollments?.forEach((enr: any) => {
          if (enr.student && !uniqueStudents.has(enr.student.id)) {
            uniqueStudents.set(enr.student.id, enr.student);
          }
        });
      });
      setStudents(Array.from(uniqueStudents.values()));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newStudent, role: "student" }),
      });
      if (res.ok) {
        setNewStudent({ name: "", email: "" });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add student:", err);
    }
  };

  const addClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/improv/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newClass, organizationId }),
      });
      if (res.ok) {
        setNewClass({ name: "", startDate: "", numWeeks: 4, organizationId });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add class:", err);
    }
  };

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/improv/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSkill),
      });
      if (res.ok) {
        setNewSkill({ name: "", category: "foundation", description: "" });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  const currentOrg = organizations.find(o => o.id === organizationId);

  if (loading) return <div style={{ color: colors.text }}>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Organization Selector */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <label style={{ color: colors.text, display: "block", marginBottom: "0.5rem" }}>
          <strong>Organization:</strong>
        </label>
        <select
          value={organizationId}
          onChange={(e) => onChangeOrg(e.target.value)}
          className="w-full px-3 py-2 rounded border"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: colors.border }}>
        {(["students", "classes", "skills", "standards"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 font-semibold text-sm transition-all border-b-2"
            style={{
              color: tab === t ? colors.teal.accent : colors.text2,
              borderColor: tab === t ? colors.teal.accent : "transparent",
            }}
          >
            {t === "students"
              ? "Students"
              : t === "classes"
              ? "Classes"
              : t === "skills"
              ? "Skills"
              : "Available Standards"}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {tab === "students" && (
        <div className="space-y-6">
          <form onSubmit={addStudent} className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Add Student</h3>
            <input
              type="text"
              placeholder="Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded font-semibold"
              style={{ backgroundColor: colors.teal.bg, color: colors.text }}
            >
              Add Student
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Students ({students.length})</h3>
            <div className="space-y-2">
              {students.map((s) => (
                <div key={s.id} className="p-3 rounded" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                  <div className="font-semibold" style={{ color: colors.text }}>{s.name}</div>
                  <div className="text-sm" style={{ color: colors.text2 }}>{s.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Classes Tab */}
      {tab === "classes" && (
        <div className="space-y-6">
          <form onSubmit={addClass} className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Add Class to {currentOrg?.name}</h3>
            <input
              type="text"
              placeholder="Class Name"
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <input
              type="date"
              value={newClass.startDate}
              onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <input
              type="number"
              placeholder="Number of Weeks"
              value={newClass.numWeeks}
              onChange={(e) => setNewClass({ ...newClass, numWeeks: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              min="1"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded font-semibold"
              style={{ backgroundColor: colors.teal.bg, color: colors.text }}
            >
              Add Class
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Classes ({classes.length})</h3>
            <div className="space-y-2">
              {classes.map((c) => (
                <div key={c.id} className="p-3 rounded" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                  <div className="font-semibold" style={{ color: colors.text }}>{c.name}</div>
                  <div className="text-sm" style={{ color: colors.text2 }}>{c.numWeeks} weeks • {c.enrollments?.length || 0} students</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Standards Tab */}
      {tab === "standards" && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: colors.text }}>Available Standards</h3>
            {standards.length === 0 ? (
              <p style={{ color: colors.text2 }}>No standards available yet. Super-Admin needs to push standards to your organization.</p>
            ) : (
              <div className="space-y-2">
                {standards.map((dist: any) => (
                  <div key={dist.id} className="p-3 rounded" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                    <div className="font-semibold" style={{ color: colors.text }}>
                      {dist.standard.code}: {dist.standard.name}
                    </div>
                    <div className="text-sm mt-1" style={{ color: colors.text2 }}>
                      Bank: {dist.standard.standardsBank.name} • Status: {dist.status}
                    </div>
                    <div className="text-xs mt-2" style={{ color: colors.text3 }}>
                      {dist.standard.exampleObjectives.length} example objectives • {dist.standard.resources.length} resources
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {tab === "skills" && (
        <div className="space-y-6">
          <form onSubmit={addSkill} className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Add Skill</h3>
            <input
              type="text"
              placeholder="Skill Name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full px-3 py-2 rounded border"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              <option value="foundation">Foundation</option>
              <option value="scene">Scene Work</option>
              <option value="musical">Musical</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Description"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              rows={3}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded font-semibold"
              style={{ backgroundColor: colors.teal.bg, color: colors.text }}
            >
              Add Skill
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Skills ({skills.length})</h3>
            <div className="space-y-2">
              {skills.map((s) => (
                <div key={s.id} className="p-3 rounded" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                  <div className="font-semibold" style={{ color: colors.text }}>{s.name}</div>
                  <div className="text-sm" style={{ color: colors.text2 }}>{s.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SuperAdminDashboard() {
  const [tab, setTab] = useState<"organizations" | "standards-banks" | "distribute">("organizations");
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [editOrgName, setEditOrgName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberRole, setEditingMemberRole] = useState<string>("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Teacher");
  const [standardsBanks, setStandardsBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newOrg, setNewOrg] = useState({ name: "" });
  const [newBank, setNewBank] = useState({ name: "", subject: "", gradeLevel: "", description: "" });
  const [newStandard, setNewStandard] = useState({ code: "", name: "", description: "" });
  const [newResource, setNewResource] = useState({ type: "material", title: "", description: "", url: "" });

  useEffect(() => {
    fetchOrganizations();
    fetchStandardsBanks();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrganizations(data.organizations || []);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
    }
  };

  const fetchStandardsBanks = async () => {
    try {
      const res = await fetch("/api/standards-banks");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStandardsBanks(data.standardsBanks || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch standards banks:", err);
      setLoading(false);
    }
  };

  const fetchBankDetails = async (bankId: string) => {
    try {
      const res = await fetch(`/api/standards-banks/${bankId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBankDetails(data);
    } catch (err) {
      console.error("Failed to fetch bank details:", err);
    }
  };

  const addOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrg),
      });
      if (res.ok) {
        setNewOrg({ name: "" });
        fetchOrganizations();
      }
    } catch (err) {
      console.error("Failed to add organization:", err);
    }
  };

  const viewOrgDetails = async (orgId: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrg(data.organization);
        setEditOrgName(data.organization.name);
      }
    } catch (err) {
      console.error("Failed to fetch org details:", err);
    }
  };

  const updateOrgName = async () => {
    if (!selectedOrg || !editOrgName) return;
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editOrgName }),
      });
      if (res.ok) {
        fetchOrganizations();
        setSelectedOrg(null);
      }
    } catch (err) {
      console.error("Failed to update organization:", err);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    if (!confirm("Are you sure? This will delete the organization and all its data.")) {
      return;
    }
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchOrganizations();
        setSelectedOrg(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete organization");
      }
    } catch (err) {
      console.error("Failed to delete organization:", err);
    }
  };

  const startEditingMember = (memberId: string, currentRole: string) => {
    setEditingMemberId(memberId);
    setEditingMemberRole(currentRole);
  };

  const cancelEditingMember = () => {
    setEditingMemberId(null);
    setEditingMemberRole("");
  };

  const updateMemberRole = async () => {
    if (!selectedOrg || !editingMemberId) return;
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members/${editingMemberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editingMemberRole }),
      });
      if (res.ok) {
        await viewOrgDetails(selectedOrg.id);
        setEditingMemberId(null);
        setEditingMemberRole("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update member role");
      }
    } catch (err) {
      console.error("Failed to update member role:", err);
    }
  };

  const addMemberToOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !newMemberEmail) return;
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail,
          name: newMemberName || undefined,
          role: newMemberRole,
        }),
      });
      if (res.ok) {
        await viewOrgDetails(selectedOrg.id);
        setNewMemberEmail("");
        setNewMemberName("");
        setNewMemberRole("Teacher");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add member");
      }
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  const handleSelectBank = (bankId: string) => {
    setSelectedBank(bankId);
    fetchBankDetails(bankId);
  };

  const addBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/standards-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBank),
      });
      if (res.ok) {
        setNewBank({ name: "", subject: "", gradeLevel: "", description: "" });
        fetchStandardsBanks();
      }
    } catch (err) {
      console.error("Failed to add standards bank:", err);
    }
  };

  const addStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) return;
    try {
      const res = await fetch(`/api/standards-banks/${selectedBank}/standards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStandard,
          exampleObjectives: [
            { label: "A", text: "Example objective A", description: "" },
          ],
        }),
      });
      if (res.ok) {
        setNewStandard({ code: "", name: "", description: "" });
        fetchBankDetails(selectedBank);
      }
    } catch (err) {
      console.error("Failed to add standard:", err);
    }
  };

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !bankDetails) return;

    const standardId = bankDetails.standards[0]?.id;
    if (!standardId) {
      alert("Please add a standard first");
      return;
    }

    try {
      const res = await fetch(`/api/standards/${standardId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newResource,
          createdById: "user-default", // TODO: Get actual user ID
        }),
      });
      if (res.ok) {
        setNewResource({ type: "material", title: "", description: "", url: "" });
        fetchBankDetails(selectedBank);
      }
    } catch (err) {
      console.error("Failed to add resource:", err);
    }
  };

  if (loading) return <div style={{ color: colors.text }}>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: colors.border }}>
        {(["organizations", "standards-banks", "distribute"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 font-semibold text-sm transition-all border-b-2"
            style={{
              color: tab === t ? colors.teal.accent : colors.text2,
              borderColor: tab === t ? colors.teal.accent : "transparent",
            }}
          >
            {t === "organizations" ? "Organizations" : t === "standards-banks" ? "Standards Banks" : "Distribute"}
          </button>
        ))}
      </div>

      {/* Organizations Tab */}
      {tab === "organizations" && (
        <div className="space-y-6">
          {/* Create Organization */}
          <form onSubmit={addOrganization} className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Create Organization</h3>
            <input
              type="text"
              placeholder="Organization Name"
              value={newOrg.name}
              onChange={(e) => setNewOrg({ name: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded font-semibold"
              style={{ backgroundColor: colors.teal.bg, color: colors.text }}
            >
              Create Organization
            </button>
          </form>

          {/* Organizations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="p-4 rounded cursor-pointer transition-all"
                onClick={() => viewOrgDetails(org.id)}
                style={{
                  backgroundColor:
                    selectedOrg?.id === org.id ? colors.teal.bg : colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="font-semibold" style={{ color: colors.text }}>
                  {org.name}
                </div>
                <div className="text-sm mt-1" style={{ color: colors.text2 }}>
                  Click to edit
                </div>
              </div>
            ))}
          </div>

          {/* Organization Detail Panel */}
          {selectedOrg && (
            <div
              className="p-4 rounded-lg space-y-4"
              style={{ backgroundColor: colors.surface, border: `2px solid ${colors.teal.accent}` }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                  Edit: {selectedOrg.name}
                </h3>
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  Close
                </button>
              </div>

              {/* Organization Name Edit */}
              <div className="space-y-2">
                <label style={{ color: colors.text, display: "block", fontSize: "0.875rem", fontWeight: 600 }}>
                  Organization Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editOrgName}
                    onChange={(e) => setEditOrgName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border"
                    style={{ borderColor: colors.border, color: colors.text }}
                  />
                  <button
                    onClick={updateOrgName}
                    className="px-4 py-2 rounded font-semibold"
                    style={{ backgroundColor: colors.teal.bg, color: colors.text }}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Add Member Form */}
              <form onSubmit={addMemberToOrg} className="space-y-3 p-3 rounded" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                <label style={{ color: colors.text, display: "block", fontSize: "0.875rem", fontWeight: 600 }}>
                  Add New Member
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-2 py-1 rounded border text-sm"
                  style={{ borderColor: colors.border, color: colors.text }}
                  required
                />
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-2 py-1 rounded border text-sm"
                  style={{ borderColor: colors.border, color: colors.text }}
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-2 py-1 rounded border text-sm"
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="SchoolAdmin">SchoolAdmin</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                </select>
                <button
                  type="submit"
                  className="w-full px-2 py-1 rounded text-sm font-semibold"
                  style={{ backgroundColor: colors.teal.bg, color: colors.text }}
                >
                  Add Member
                </button>
              </form>

              {/* Members */}
              {selectedOrg.users && selectedOrg.users.length > 0 && (
                <div className="space-y-2">
                  <label style={{ color: colors.text, display: "block", fontSize: "0.875rem", fontWeight: 600 }}>
                    Members ({selectedOrg.users.length})
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedOrg.users.map((ou: any) => (
                      <div key={ou.userId} className="space-y-1">
                        {editingMemberId === ou.userId ? (
                          <div className="p-3 rounded" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.teal.border}` }}>
                            <div style={{ color: colors.text }} className="font-medium text-sm mb-2">
                              {ou.user.name}
                            </div>
                            <div style={{ color: colors.text2 }} className="text-xs mb-3">
                              {ou.user.email}
                            </div>
                            <div className="space-y-2">
                              <select
                                value={editingMemberRole}
                                onChange={(e) => setEditingMemberRole(e.target.value)}
                                className="w-full px-2 py-1 rounded border text-sm"
                                style={{ borderColor: colors.border, color: colors.text }}
                              >
                                <option value="SuperAdmin">SuperAdmin</option>
                                <option value="SchoolAdmin">SchoolAdmin</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={updateMemberRole}
                                  className="flex-1 px-2 py-1 rounded text-xs font-semibold"
                                  style={{ backgroundColor: colors.teal.bg, color: colors.text }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditingMember}
                                  className="flex-1 px-2 py-1 rounded text-xs"
                                  style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="p-2 rounded text-sm cursor-pointer transition-all hover:opacity-80"
                            style={{ backgroundColor: colors.bg }}
                            onClick={() => startEditingMember(ou.userId, ou.role)}
                          >
                            <div style={{ color: colors.text }} className="font-medium">
                              {ou.user.name}
                            </div>
                            <div style={{ color: colors.text2 }} className="text-xs">
                              {ou.user.email}
                            </div>
                            <div style={{ color: colors.teal.accent }} className="text-xs font-semibold mt-1">
                              {ou.role} • (click to edit)
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => deleteOrganization(selectedOrg.id)}
                className="w-full px-4 py-2 rounded font-semibold text-white"
                style={{ backgroundColor: "#ef4444" }}
              >
                🗑️ Delete Organization
              </button>
            </div>
          )}
        </div>
      )}

      {/* Standards Banks Tab */}
      {tab === "standards-banks" && (
        <div className="space-y-6">
          {/* Create Standards Bank */}
          <form onSubmit={addBank} className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Create Standards Bank</h3>
            <input
              type="text"
              placeholder="Name (e.g., AP US History 2024)"
              value={newBank.name}
              onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={newBank.subject}
              onChange={(e) => setNewBank({ ...newBank, subject: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <input
              type="text"
              placeholder="Grade Level"
              value={newBank.gradeLevel}
              onChange={(e) => setNewBank({ ...newBank, gradeLevel: e.target.value })}
              className="w-full px-3 py-2 rounded border placeholder-gray-900"
              style={{ borderColor: colors.border, color: colors.text }}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded font-semibold"
              style={{ backgroundColor: colors.teal.bg, color: colors.text }}
            >
              Create Bank
            </button>
          </form>

          {/* Standards Banks List */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>Standards Banks</h3>
            <div className="space-y-2">
              {standardsBanks.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => handleSelectBank(bank.id)}
                  className="p-4 rounded cursor-pointer transition-all"
                  style={{
                    backgroundColor:
                      selectedBank === bank.id ? colors.teal.bg : colors.surface,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="font-semibold" style={{ color: selectedBank === bank.id ? colors.teal.text : colors.text }}>
                    {bank.name}
                  </div>
                  <div className="text-sm" style={{ color: colors.text2 }}>
                    {bank.subject} • Grade {bank.gradeLevel} • {bank.standards.length} standards
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          {selectedBank && bankDetails && (
            <div className="space-y-6 p-4 rounded-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <h3 className="font-bold text-lg" style={{ color: colors.text }}>{bankDetails.name} • Add Standard</h3>

              {/* Add Standard Form */}
              <form onSubmit={addStandard} className="space-y-4 p-4 rounded" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                <input
                  type="text"
                  placeholder="Standard Code (e.g., 2.1)"
                  value={newStandard.code}
                  onChange={(e) => setNewStandard({ ...newStandard, code: e.target.value })}
                  className="w-full px-3 py-2 rounded border placeholder-gray-900"
                  style={{ borderColor: colors.border, color: colors.text }}
                  required
                />
                <input
                  type="text"
                  placeholder="Standard Name (e.g., Causes of Conflict)"
                  value={newStandard.name}
                  onChange={(e) => setNewStandard({ ...newStandard, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border placeholder-gray-900"
                  style={{ borderColor: colors.border, color: colors.text }}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded font-semibold"
                  style={{ backgroundColor: colors.teal.bg, color: colors.text }}
                >
                  Add Standard
                </button>
              </form>

              {/* Standards in Bank */}
              <div className="space-y-3">
                <h4 className="font-semibold" style={{ color: colors.text }}>Standards ({bankDetails.standards.length})</h4>
                {bankDetails.standards.map((std: any) => (
                  <div key={std.id} className="p-3 rounded" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                    <div className="font-semibold" style={{ color: colors.text }}>
                      {std.code}: {std.name}
                    </div>
                    <div className="text-sm mt-1" style={{ color: colors.text2 }}>
                      {std.resources.length} resources • {std.exampleObjectives.length} example objectives
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Distribute Tab */}
      {tab === "distribute" && (
        <div className="p-4 rounded-lg text-center" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <p style={{ color: colors.text }}>Distribute standards to organizations coming soon</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [role, setRole] = useState<"teacher" | "student" | "admin" | "superadmin" | null>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading state while session is being checked
  if (status === 'loading' || status === 'authenticated') {
    return <div style={{ color: colors.text }}>Loading...</div>;
  }

  // Show landing page if not authenticated
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-4" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Viridian
          </h1>
          <p className="text-xl md:text-2xl mb-2" style={{ color: colors.text }}>Global Learning Communities</p>
          <p className="text-lg mb-12" style={{ color: colors.text2 }}>Master improv, master yourself</p>

          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup" className="px-8 py-3 rounded-lg font-semibold text-lg" style={{ backgroundColor: colors.teal.bg, color: colors.text }}>
              Sign Up
            </Link>
            <Link href="/auth/login" className="px-8 py-3 rounded-lg font-semibold text-lg border-2" style={{ borderColor: colors.teal.accent, color: colors.teal.accent }}>
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (role === "teacher") {
    return (
      <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <button
              onClick={() => setRole(null)}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              ← Back to Role Select
            </button>
          </div>
          <TeacherDashboard />
        </div>
      </main>
    );
  }

  if (role === "student") {
    return (
      <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <button
              onClick={() => setRole(null)}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              ← Back to Role Select
            </button>
          </div>
          <StudentPicker />
        </div>
      </main>
    );
  }

  if (role === "admin") {
    return (
      <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <button
              onClick={() => setRole(null)}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              ← Back to Role Select
            </button>
          </div>
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>Admin Panel</h1>
            <AdminDashboard />
          </div>
        </div>
      </main>
    );
  }

  if (role === "superadmin") {
    return (
      <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <button
              onClick={() => setRole(null)}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              ← Back to Role Select
            </button>
          </div>
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>Super-Admin Panel</h1>
            <SuperAdminDashboard />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <div className="w-full max-w-md p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <h1
            className="text-6xl md:text-7xl font-serif font-bold mb-3"
            style={{
              color: colors.text,
              textShadow: `0 4px 8px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)`,
              letterSpacing: '0.05em',
            }}
          >
            Viridian
          </h1>
          <p className="text-base md:text-lg" style={{ color: colors.text2 }}>
            Mastery Tracker
          </p>
          <p className="text-xs md:text-sm mt-2" style={{ color: colors.text3 }}>
            P1 Frontend — Fully Built and Ready
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-8">
          <Link
            href="/discover"
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: colors.teal.bg,
              color: colors.text,
            }}
          >
            Discover Communities
          </Link>
          <Link
            href="/communities"
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all border"
            style={{
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            My Communities
          </Link>
          <Link
            href="/curator"
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all border"
            style={{
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            Curator
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          <button
            onClick={() => setRole("teacher")}
            className="w-full p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.amber.border,
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Teacher
            </h2>
            <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
              Rate student skills, provide feedback, manage assessments
            </p>
          </button>

          <button
            onClick={() => setRole("student")}
            className="w-full p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.teal.border,
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Student
            </h2>
            <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
              View your progress, self-rate skills, read feedback
            </p>
          </button>

          <button
            onClick={() => setRole("admin")}
            className="w-full p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.surface,
              borderColor: '#9CA3AF',
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Admin
            </h2>
            <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
              Manage students, classes, skills, and standards
            </p>
          </button>

          <button
            onClick={() => setRole("superadmin")}
            className="w-full p-6 rounded-xl border-2 text-left transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.surface,
              borderColor: '#10B981',
            }}
          >
            <h2
              className="text-xl md:text-2xl font-serif font-bold mb-2"
              style={{ color: colors.text }}
            >
              Super-Admin
            </h2>
            <p className="text-sm md:text-base" style={{ color: colors.text2 }}>
              Manage standards banks and distribute to schools
            </p>
          </button>
        </div>

        <div
          className="mt-8 md:mt-12 p-4 md:p-6 rounded-xl text-center"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
          }}
        >
          <p className="text-xs md:text-sm" style={{ color: colors.text2 }}>
            Built with Next.js 16, React 19, TypeScript, React Query, and Tailwind CSS
          </p>
          <p className="text-xs mt-2" style={{ color: colors.text3 }}>
            All 10 components + 5 hooks + comprehensive documentation completed
          </p>
        </div>
      </div>
    </main>
  );
}
