'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface RsvpFormConfig {
  formName: string;
  hostedBy: string;
  nameFieldLabel: string;
  confirmationHeader: string;
  confirmationSubheader: string;
  confirmationSignature: string;
  fields: { id: string; label: string; required: boolean; type?: string; options?: string[] }[];
  createdAt: string;
}

export default function RsvpPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [config, setConfig] = useState<RsvpFormConfig | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem(`lokeet_portal_rsvp_form_${eventId}`);
    if (!raw) { setNotFound(true); return; }
    try {
      const cfg: RsvpFormConfig = JSON.parse(raw);
      setConfig(cfg);
      const initial: Record<string, string> = {};
      cfg.fields.forEach(f => { initial[f.id] = ''; });
      setValues(initial);
    } catch {
      setNotFound(true);
    }
  }, [eventId]);

  function validate() {
    if (!config) return false;
    const errs: Record<string, string> = {};
    config.fields.forEach(f => {
      if (f.required && !values[f.id]?.trim()) {
        errs[f.id] = 'This field is required';
      }
      if (f.id === 'email' && values[f.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.id])) {
        errs[f.id] = 'Please enter a valid email address';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // Backend integration point — store response locally for now
    const responses = JSON.parse(localStorage.getItem(`lokeet_portal_rsvp_responses_${eventId}`) || '[]');
    responses.push({ ...values, submitted_at: new Date().toISOString() });
    localStorage.setItem(`lokeet_portal_rsvp_responses_${eventId}`, JSON.stringify(responses));
    setSubmitted(true);
  }

  if (notFound) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
          <p className="text-gray-500 text-sm">This invite form doesn&apos;t exist or the link may have expired.</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#42a746] flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {config.confirmationHeader || "You're on the list!"}
          </h1>
          <p className="text-gray-500 mt-2">
            {config.confirmationSubheader || "Thank you for your interest! We'll be in touch soon."}
          </p>
          {config.confirmationSignature && (
            <p className="text-sm font-medium text-gray-700 mt-4">{config.confirmationSignature}</p>
          )}
          <p className="text-xs text-gray-300 mt-2">
            Intake form created on{' '}
            <a href="https://lokeet.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 transition-colors">
              Lokeet.io
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{config.formName || 'Event Signup'}</h1>
          {config.hostedBy && (
            <p className="text-sm text-gray-500">Hosted by <span className="font-medium text-gray-700">{config.hostedBy}</span></p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields
            .filter(f => f.id !== 'hosted_by')
            .map(field => {
              const type = field.id === 'email' ? 'email' : (field.type ?? 'text');
              const baseInput = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent text-sm ${errors[field.id] ? 'border-red-400' : 'border-gray-200'}`;
              const onChange = (val: string) => {
                setValues(p => ({ ...p, [field.id]: val }));
                if (errors[field.id]) setErrors(p => ({ ...p, [field.id]: '' }));
              };

              return (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>

                  {type === 'paragraph' && (
                    <textarea rows={4} value={values[field.id] ?? ''} onChange={e => onChange(e.target.value)}
                      className={`${baseInput} resize-none`} />
                  )}

                  {(type === 'radio') && field.options && (
                    <div className="space-y-2 mt-1">
                      {field.options.map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name={field.id} value={opt} checked={values[field.id] === opt}
                            onChange={() => onChange(opt)}
                            className="w-4 h-4 accent-gray-900" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {(type === 'checkbox') && field.options && (
                    <div className="space-y-2 mt-1">
                      {field.options.map(opt => {
                        const checked = (values[field.id] ?? '').split('||').filter(Boolean).includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={checked}
                              onChange={() => {
                                const current = (values[field.id] ?? '').split('||').filter(Boolean);
                                const next = checked ? current.filter(v => v !== opt) : [...current, opt];
                                onChange(next.join('||'));
                              }}
                              className="w-4 h-4 accent-gray-900" />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {(type === 'select') && field.options && (
                    <select value={values[field.id] ?? ''} onChange={e => onChange(e.target.value)}
                      className={baseInput}>
                      <option value="">Select…</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {!['paragraph', 'radio', 'checkbox', 'select'].includes(type) && (
                    <input
                      type={type === 'email' ? 'email' : type === 'number' ? 'number' : type === 'phone' ? 'tel' : type === 'date' ? 'date' : 'text'}
                      value={values[field.id] ?? ''}
                      onChange={e => onChange(e.target.value)}
                      placeholder={type === 'email' ? 'you@example.com' : ''}
                      className={baseInput}
                    />
                  )}

                  {errors[field.id] && (
                    <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
                  )}
                </div>
              );
            })}

          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 mt-2"
          >
            Request Invite
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">Powered by Lokeet</p>
      </div>
    </div>
  );
}
