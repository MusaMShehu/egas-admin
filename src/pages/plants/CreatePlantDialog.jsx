// src/components/admin/plants/CreatePlantDialog.jsx
import React, { useMemo, useState } from 'react';
import { FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormRow from '../../components/ui/FormRow';
import FormField from '../../components/ui/FormField';
import { adminPlantsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';

const DEFAULT_HOURS = {
  open: '08:00',
  close: '18:00',
  daysOpen: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const emptyForm = {
  name: '',
  code: '',
  description: '',
  address: '',
  city: '',
  state: '',
  serviceRadiusKm: 30,
  gps: { lng: '', lat: '' },
  contactPerson: { name: '', phone: '', email: '' },
  operatingHours: { ...DEFAULT_HOURS },
};

const CreatePlantDialog = ({ plant = null, onClose, onSuccess }) => {
  const isEdit = !!plant?._id;
  const [form, setForm] = useState(() => {
    if (!plant) return { ...emptyForm, gps: { lng: '', lat: '' } };
    const p = plant;
    const c = p.gpsCoordinates?.coordinates || [];
    return {
      name: p.name || '',
      code: p.code || '',
      description: p.description || '',
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      serviceRadiusKm: p.serviceRadiusKm ?? 30,
      gps: { lng: c[0] ?? '', lat: c[1] ?? '' },
      contactPerson: {
        name: p.contactPerson?.name || '',
        phone: p.contactPerson?.phone || '',
        email: p.contactPerson?.email || '',
      },
      operatingHours: {
        open: p.operatingHours?.open || DEFAULT_HOURS.open,
        close: p.operatingHours?.close || DEFAULT_HOURS.close,
        daysOpen: p.operatingHours?.daysOpen || DEFAULT_HOURS.daysOpen,
      },
    };
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useSnackbar();

  const set = (path, value) => {
    setForm((f) => {
      const next = { ...f };
      const parts = path.split('.');
      let node = next;
      for (let i = 0; i < parts.length - 1; i++) {
        node[parts[i]] = { ...node[parts[i]] };
        node = node[parts[i]];
      }
      node[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const toggleDay = (day) => {
    setForm((f) => {
      const days = new Set(f.operatingHours.daysOpen);
      days.has(day) ? days.delete(day) : days.add(day);
      return {
        ...f,
        operatingHours: { ...f.operatingHours, daysOpen: [...days] },
      };
    });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('gps.lng', pos.coords.longitude);
        set('gps.lat', pos.coords.latitude);
      },
      (err) => setError(err.message || 'Could not read GPS coordinates'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const mapPreviewUrl = useMemo(() => {
    const lng = Number(form.gps.lng);
    const lat = Number(form.gps.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }, [form.gps.lat, form.gps.lng]);

  const validate = () => {
    if (!form.name.trim()) return 'Plant name is required';
    if (!form.code.trim()) return 'Plant code is required';
    if (!/^[A-Z0-9-]{3,32}$/i.test(form.code.trim())) {
      return 'Code must be 3–32 chars (A–Z, 0–9, hyphens)';
    }
    if (!form.address.trim()) return 'Address is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.state.trim()) return 'State is required';
    const lng = Number(form.gps.lng);
    const lat = Number(form.gps.lat);
    if (
      !Number.isFinite(lng) || !Number.isFinite(lat) ||
      lng < -180 || lng > 180 || lat < -90 || lat > 90
    ) {
      return 'Enter valid GPS coordinates (lng, lat) or use "My location"';
    }
    if (form.operatingHours.daysOpen.length === 0) {
      return 'Select at least one operating day';
    }
    return '';
  };

  const submit = async () => {
    const v = validate();
    if (v) return setError(v);

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      serviceRadiusKm: Number(form.serviceRadiusKm) || 30,
      gpsCoordinates: {
        type: 'Point',
        coordinates: [Number(form.gps.lng), Number(form.gps.lat)],
      },
      contactPerson: {
        name: form.contactPerson.name.trim() || undefined,
        phone: form.contactPerson.phone.trim() || undefined,
        email: form.contactPerson.email.trim() || undefined,
      },
      operatingHours: {
        open: form.operatingHours.open,
        close: form.operatingHours.close,
        daysOpen: form.operatingHours.daysOpen,
      },
    };

    setLoading(true); setError('');
    try {
      if (isEdit) {
        await adminPlantsAPI.update(plant._id, payload);
        success('Plant updated');
      } else {
        await adminPlantsAPI.create(payload);
        success('Plant created. Approve it to activate.');
      }
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to save plant';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={loading ? () => {} : onClose}
      title={isEdit ? `Edit — ${plant.name}` : 'Register new plant'}
      subtitle={isEdit ? 'Update plant details' : 'New plants require approval before they can accept refills'}
      size="lg"
      loading={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={loading}>
            {isEdit ? 'Save changes' : 'Create plant'}
          </Button>
        </>
      }
    >
      {error && (
        <div className="plant-error" style={{ marginBottom: 12 }}>
          <span>{error}</span>
        </div>
      )}

      <h4 className="plant-section-title">Identity</h4>
      <FormRow cols={2}>
        <FormField label="Plant name" name="name" required
          value={form.name}
          onChange={(e) => { set('name', e.target.value); setError(''); }}
          disabled={loading} />
        <FormField label="Code" name="code" required
          help="Uppercase; A–Z, 0–9, hyphens (e.g. LAG-01)"
          value={form.code}
          onChange={(e) => { set('code', e.target.value.toUpperCase()); setError(''); }}
          disabled={loading} />
      </FormRow>
      <FormRow cols={1}>
        <FormField label="Description" name="description" as="textarea" rows={2}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          disabled={loading} />
      </FormRow>

      <h4 className="plant-section-title">Location</h4>
      <FormRow cols={1}>
        <FormField label="Address" name="address" required
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          disabled={loading} />
      </FormRow>
      <FormRow cols={3}>
        <FormField label="City" name="city" required
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          disabled={loading} />
        <FormField label="State" name="state" required
          value={form.state}
          onChange={(e) => set('state', e.target.value)}
          disabled={loading} />
        <FormField label="Service radius (km)" name="serviceRadiusKm" type="number" min="1" max="500"
          value={form.serviceRadiusKm}
          onChange={(e) => set('serviceRadiusKm', e.target.value)}
          disabled={loading} />
      </FormRow>

      <h4 className="plant-section-title">
        GPS coordinates
        <span className="plant-muted" style={{ marginLeft: 8, fontSize: 12 }}>
          (lng first, then lat)
        </span>
      </h4>
      <FormRow cols={3}>
        <FormField label="Longitude" name="lng" type="number" step="0.000001"
          required
          value={form.gps.lng}
          onChange={(e) => { set('gps.lng', e.target.value); setError(''); }}
          disabled={loading} />
        <FormField label="Latitude" name="lat" type="number" step="0.000001"
          required
          value={form.gps.lat}
          onChange={(e) => { set('gps.lat', e.target.value); setError(''); }}
          disabled={loading} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Button variant="outline" size="sm" leftIcon={<FaCrosshairs />}
            onClick={useMyLocation} disabled={loading}>
            My location
          </Button>
          {mapPreviewUrl && (
            <a className="plant-map-link" href={mapPreviewUrl} target="_blank" rel="noreferrer">
              <FaMapMarkerAlt /> Preview
            </a>
          )}
        </div>
      </FormRow>

      <h4 className="plant-section-title">Contact person</h4>
      <FormRow cols={3}>
        <FormField label="Name" name="cname" value={form.contactPerson.name}
          onChange={(e) => set('contactPerson.name', e.target.value)}
          disabled={loading} />
        <FormField label="Phone" name="cphone" value={form.contactPerson.phone}
          onChange={(e) => set('contactPerson.phone', e.target.value)}
          disabled={loading} />
        <FormField label="Email" name="cemail" type="email" value={form.contactPerson.email}
          onChange={(e) => set('contactPerson.email', e.target.value)}
          disabled={loading} />
      </FormRow>

      <h4 className="plant-section-title">Operating hours</h4>
      <FormRow cols={2}>
        <FormField label="Open" name="open" type="time"
          value={form.operatingHours.open}
          onChange={(e) => set('operatingHours.open', e.target.value)}
          disabled={loading} />
        <FormField label="Close" name="close" type="time"
          value={form.operatingHours.close}
          onChange={(e) => set('operatingHours.close', e.target.value)}
          disabled={loading} />
      </FormRow>
      <div className="plant-days">
        {ALL_DAYS.map((d) => (
          <label key={d} className="plant-day">
            <input
              type="checkbox"
              checked={form.operatingHours.daysOpen.includes(d)}
              onChange={() => toggleDay(d)}
              disabled={loading}
            />
            <span>{d}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
};

export default CreatePlantDialog;