import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Phone, Mail, MapPin, HelpCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  component: Support,
  head: () => ({
    meta: [
      { title: "Customer Support — Bharat Bank" },
      { name: "description", content: "Chat with Bharat Bank support, raise service requests and find help with net banking." },
      { property: "og:title", content: "Customer Support — Bharat Bank" },
      { property: "og:description", content: "Chat with Bharat Bank support, raise service requests and find help with net banking." },
      { property: "og:url", content: "https://indbanksample.lovable.app/support" },
    ],
    links: [{ rel: "canonical", href: "https://indbanksample.lovable.app/support" }],
  }),
});

function Support() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: string; text: string }[]>([
    { from: "agent", text: "Hi Arjun, how can I help you today?" },
  ]);
  return (
    <AppLayout>
      <PageHeader title="Support Center" subtitle="We are here 24x7 for you" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="bg-gradient-primary text-primary-foreground p-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /><span className="font-semibold">Live Chat — Agent Riya</span><span className="ml-auto text-[10px] bg-success px-2 py-0.5 rounded-full">ONLINE</span></div>
            <div className="p-4 h-64 overflow-y-auto space-y-2 bg-secondary/30">
              {chat.map((m, i) => (
                <div key={i} className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${m.from === "agent" ? "bg-card border" : "ml-auto bg-primary text-primary-foreground"}`}>{m.text}</div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!msg) return; setChat([...chat, { from: "me", text: msg }, { from: "agent", text: "Thanks! Our team will respond shortly." }]); setMsg(""); }} className="flex gap-2 p-3 border-t">
              <label htmlFor="chat-message" className="sr-only">Chat message</label>
              <Input id="chat-message" aria-label="Chat message" placeholder="Type your message…" value={msg} onChange={(e) => setMsg(e.target.value)} />
              <Button type="submit" aria-label="Send message" className="bg-gradient-primary"><Send className="w-4 h-4" /></Button>
            </form>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold mb-3">Raise a Complaint / Ticket</h2>
            <div className="space-y-3">
              <label htmlFor="ticket-subject" className="sr-only">Subject</label>
              <Input id="ticket-subject" aria-label="Subject" placeholder="Subject" />
              <label htmlFor="ticket-body" className="sr-only">Describe your issue</label>
              <Textarea id="ticket-body" aria-label="Describe your issue" placeholder="Describe your issue…" rows={4} />
              <Button className="bg-gradient-primary" onClick={() => toast.success("Ticket #SR2486 created")}>Submit Ticket</Button>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          {[
            { i: Phone, l: "Toll Free", v: "1800-123-4567" },
            { i: Mail, l: "Email", v: "care@bharatbank.in" },
            { i: MapPin, l: "Branch Locator", v: "200+ branches" },
            { i: HelpCircle, l: "FAQ", v: "Browse answers" },
          ].map((x) => (
            <Card key={x.l} className="p-4 flex items-center gap-3 hover:shadow-elegant transition">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><x.i className="w-5 h-5" /></div>
              <div><div className="text-xs text-muted-foreground">{x.l}</div><div className="font-semibold">{x.v}</div></div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}