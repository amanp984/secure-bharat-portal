import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { PageHeader } from "@/components/banking/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Phone, Mail, MapPin, Send, CreditCard, AlertCircle, UserCheck,
  Lock, Wifi, HandCoins, FileText, Paperclip, MessageSquare,
  CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { tickets, faqs } from "@/lib/banking-data";

export const Route = createFileRoute("/support")({
  component: Support,
  head: () => ({
    meta: [
      { title: "Service Requests & Support — Indian Bank One" },
      { name: "description", content: "Raise complaints, track service requests and get 24x7 support for Indian Bank One Net Banking." },
      { property: "og:title", content: "Service Requests & Support — Indian Bank One" },
      { property: "og:description", content: "Raise complaints, track service requests and get 24x7 support for Indian Bank One Net Banking." },
      { property: "og:url", content: "https://www.indianbankone.in/support" },
    ],
    links: [{ rel: "canonical", href: "https://www.indianbankone.in/support" }],
  }),
});

const categories = [
  { label: "Debit Card Issues", icon: CreditCard, color: "from-blue-600 to-indigo-700" },
  { label: "Failed Transactions", icon: AlertCircle, color: "from-rose-600 to-red-700" },
  { label: "KYC Update", icon: UserCheck, color: "from-emerald-600 to-teal-700" },
  { label: "Account Freeze", icon: Lock, color: "from-slate-600 to-slate-800" },
  { label: "Net Banking Issues", icon: Wifi, color: "from-purple-600 to-pink-600" },
  { label: "Loan Support", icon: HandCoins, color: "from-amber-500 to-orange-600" },
  { label: "Cheque Book Request", icon: FileText, color: "from-cyan-600 to-blue-700" },
];

const statusStyle: Record<string, string> = {
  Resolved: "bg-success/10 text-success",
  "In Progress": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Open: "bg-primary/10 text-primary",
};

function Support() {
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [desc, setDesc] = useState("");

  const submitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !desc) {
      toast.error("Please fill subject and description");
      return;
    }
    toast.success(`Ticket #SR${Math.floor(248000 + Math.random() * 1000)} created successfully`);
    setSubject(""); setType(""); setDesc("");
  };

  return (
    <AppLayout>
      <PageHeader title="Service Requests & Support" subtitle="We're here 24x7 to help — raise tickets, browse FAQs or chat with our team" />

      {/* Live Support */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-0 overflow-hidden mb-4 shadow-card-soft">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-lg ring-2 ring-white/30">
                  RP
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-blue-700" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/70 font-bold">Live Banking Agent</div>
                <div className="text-base font-bold">Riya Patel</div>
                <div className="text-[11px] flex items-center gap-1.5 text-white/80">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-bold">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
                  </span>
                  <Clock className="w-3 h-3" /> Estimated wait: 1 min
                </div>
              </div>
            </div>
            <Button className="bg-white text-blue-700 hover:bg-white/90 font-bold">
              <MessageSquare className="w-4 h-4 mr-1.5" />Start Chat
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x text-center">
            {[
              { i: Phone, l: "Toll Free", v: "1800-572-9900" },
              { i: Mail, l: "Email", v: "support@indianbankone.in" },
              { i: MapPin, l: "Branches", v: "200+ locations" },
              { i: MessageSquare, l: "WhatsApp", v: "+91 70xxxxxx00" },
            ].map((x) => (
              <div key={x.l} className="p-3">
                <div className="w-8 h-8 mx-auto rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1">
                  <x.i className="w-4 h-4" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{x.l}</div>
                <div className="text-[12px] font-semibold truncate">{x.v}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Service categories */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-4 mb-4 shadow-card-soft">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" /> Service Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {categories.map((c) => (
              <button
                key={c.label}
                onClick={() => { setType(c.label); toast(`${c.label} selected`); }}
                className="group p-2.5 rounded-lg border hover:border-primary/40 hover:shadow-card-soft hover:-translate-y-0.5 transition-all bg-gradient-to-br from-card to-secondary/20 flex flex-col items-center text-center gap-1.5"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center shadow-sm`}>
                  <c.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-[10.5px] font-semibold leading-tight">{c.label}</div>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Raise complaint */}
        <Card className="lg:col-span-2 p-5 shadow-card-soft">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" /> Raise a Complaint / Ticket
          </h2>
          <form onSubmit={submitTicket} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="t-subject" className="text-[11px] font-semibold text-muted-foreground">Subject</label>
                <Input id="t-subject" placeholder="Brief subject…" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label htmlFor="t-type" className="text-[11px] font-semibold text-muted-foreground">Complaint Type</label>
                <select
                  id="t-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Priority</label>
              <div className="flex gap-2 mt-1">
                {["Low", "Medium", "High", "Urgent"].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-3 h-8 text-[11px] font-bold rounded-md border transition-all ${
                      priority === p ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="t-desc" className="text-[11px] font-semibold text-muted-foreground">Description</label>
              <Textarea id="t-desc" placeholder="Describe your issue in detail…" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => toast("Attachment upload coming soon")}>
                <Paperclip className="w-3.5 h-3.5 mr-1.5" />Attach File
              </Button>
              <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                <Send className="w-3.5 h-3.5 mr-1.5" />Submit Ticket
              </Button>
            </div>
          </form>
        </Card>

        {/* Ticket history */}
        <Card className="p-4 shadow-card-soft h-fit">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Ticket History
          </h2>
          <div className="space-y-2.5">
            {tickets.map((t) => (
              <div key={t.id} className="p-2.5 rounded-lg border bg-secondary/30 hover:bg-secondary/60 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono font-bold text-primary">#{t.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusStyle[t.status]}`}>
                    {t.status === "Resolved" ? <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" /> : <Clock className="w-2.5 h-2.5 inline mr-0.5" />}
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[12px] font-semibold leading-tight">{t.subject}</div>
                <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                  <span>Created {t.createdAt}</span>
                </div>
                <div className="text-[10.5px] text-muted-foreground mt-1 italic">{t.resolution}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4">
        <Card className="p-5 shadow-card-soft">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Banking FAQs
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-[13px] font-semibold text-left hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[12.5px] text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
