
import React, { useEffect, useRef, useState } from 'react';
import 'primereact/resources/themes/soho-dark/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router';
import api, { type CreateCodespaceResponse } from './api';
import { Toast } from 'primereact/toast';
import { SHA512 } from './crypto';
import SecurityViolation from './components/SecurityViolation';


function App() {

  const navigate = useNavigate();

  // State for join form
  const [joinUsername, setJoinUsername] = useState('');
  const [codespaceId, setCodespaceId] = useState('');
  // State for create form
  const [createUsername, setCreateUsername] = useState('');

  const toast = useRef<Toast>(null);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await api.codespaceExist(codespaceId)) {
      navigate(`/codespace/${codespaceId}?username=${joinUsername}`)
    } else {
      toast.current?.show({
        severity: "warn",
        summary: "Codespace Not Found",
        detail: "No codespace with that ID exist. Try creating a new codespace instead."
      })
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codespace: CreateCodespaceResponse = await api.createCodespace(createUsername);
    if(codespace.success) {
      navigate(`/codespace/${codespace.codespaceId}?username=${createUsername}`);
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Error creating codespace",
        detail: "Codespace could not be created, please report this incident."
      })
    }
  };

  const [licenseVerified, setLicenseVerified] = useState<boolean>(false);

  useEffect(() => {
    async function verifyLicense() {
      const licenseKey = import.meta.env.VITE_LICENSE_KEY
      const keyHash = await SHA512(licenseKey);
      const expectedKeyHash = "3fda53d92a97e66c021fe1a96cdbde82e0ffb7c3abfafd6fd09736e7b1f80836dfa461ff485839ef22aab9893f4255a7892cf4d9a2e9bd601e90a01cd5cf0bcc";
      if(keyHash === expectedKeyHash) {
        setLicenseVerified(true);
      }
    }

    verifyLicense();
  }, [])

  if(!licenseVerified) {
    return (
      <SecurityViolation />
    )
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex flex-col items-center justify-center p-6">
      <Toast ref={toast} />
      <h1 className="text-4xl font-bold mb-8 text-[#3794ff] tracking-wide">Syncode</h1>
      <div className="flex flex-row gap-8 w-full max-w-3xl justify-center">
        {/* Join Codespace Form */}
        <Card title="Join Codespace" className="bg-[#252526] text-[#d4d4d4] flex-1 min-w-[320px]">
          <form onSubmit={handleJoinSubmit}>
            <div className="mb-4">
              <label htmlFor="join-username" className="block text-[#d4d4d4] mb-1">Username</label>
              <InputText id="join-username" value={joinUsername} onChange={e => setJoinUsername(e.target.value)} autoComplete="off" required className="w-full" />
            </div>
            <div className="mb-6">
              <label htmlFor="codespace-id" className="block text-[#d4d4d4] mb-1">Codespace ID</label>
              <InputText id="codespace-id" value={codespaceId} onChange={e => setCodespaceId(e.target.value)} autoComplete="off" required className="w-full" />
            </div>
            <Button label="Join" icon="pi pi-sign-in" type="submit" className="w-full p-button-primary" />
          </form>
        </Card>
        {/* Create Codespace Form */}
        <Card title="Create Codespace" className="bg-[#252526] text-[#d4d4d4] flex-1 min-w-[320px]">
          <form onSubmit={handleCreateSubmit}>
            <div className="mb-6">
              <label htmlFor="create-username" className="block text-[#d4d4d4] mb-1">Username</label>
              <InputText id="create-username" value={createUsername} onChange={e => setCreateUsername(e.target.value)} autoComplete="off" required className="w-full" />
            </div>
            <Button label="Create" icon="pi pi-plus" type="submit" className="w-full p-button-success" />
          </form>
        </Card>
      </div>
    </div>
  );
}

export default App
