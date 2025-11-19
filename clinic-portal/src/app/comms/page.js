"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { useToast } from "../../components/ui/toast";

export default function CommsPage() {
  const [tab, setTab] = useState("sms");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Communications</h1>
        <p className="text-sm text-app-muted">Send text messages or marketing emails</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="sms">Text (SMS)</TabsTrigger>
          <TabsTrigger value="email">Marketing Email</TabsTrigger>
        </TabsList>
        <TabsContent value="sms">
          <SmsForm />
        </TabsContent>
        <TabsContent value="email">
          <EmailForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SmsForm() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const send = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/send-sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, body }) });
      if (!res.ok) throw new Error(await res.text());
      notify({ title: 'Text sent' });
      setBody("");
    } catch (e) {
      notify({ title: 'Failed to send SMS', description: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Text Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-app-muted mb-1">Recipient phone number</div>
          <Input placeholder="+1XXXXXXXXXX" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-app-muted mb-1">Message</div>
          <textarea className="min-h-32 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="text-right">
          <Button onClick={send} disabled={!to || !body || loading}>Send SMS</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailForm() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Hello from Dental Clinic</p>");
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, html }) });
      if (!res.ok) throw new Error(await res.text());
      notify({ title: 'Email queued' });
    } catch (e) {
      notify({ title: 'Failed to send email', description: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs text-app-muted mb-1">Recipient email</div>
            <Input placeholder="recipient@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Subject</div>
            <Input placeholder="Welcome to our clinic" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">HTML Content</div>
            <textarea className="min-h-48 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={html} onChange={(e) => setHtml(e.target.value)} />
          </div>
          <div className="text-right">
            <Button onClick={send} disabled={!to || !subject || !html || loading}>Send Email</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Inbox Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-app-bg border-b border-app-border text-sm">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-semibold">DC</div>
                <div>
                  <div className="font-medium">Dental Clinic</div>
                  <div className="text-xs text-app-muted">no-reply@clinic.example</div>
                </div>
              </div>
              <div className="text-xs text-app-muted">Just now</div>
            </div>
            <div className="px-4 py-3">
              <div className="font-semibold mb-2">{subject || '(no subject)'}</div>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
