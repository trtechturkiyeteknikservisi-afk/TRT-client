'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface AddressData {
  name: string;
  counties: Array<{
    name: string;
    districts: Array<{
      name: string;
      neighborhoods: Array<{
        name: string;
        code: string;
      }>;
    }>;
  }>;
}

export interface AddressComponents {
  city: string;
  county: string;
  neighborhood: string;
  street: string;
  building: string;
  door: string;
}

interface AddressSelectorProps {
  onAddressChange: (fullAddress: string, components: AddressComponents) => void;
  initialValue?: string;
  isHeroMini?: boolean;
}

export function AddressSelector({ onAddressChange, isHeroMini = false }: AddressSelectorProps) {
  const t = useTranslations('Contact');
  const idPrefix = React.useId();
  const [data, setData] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRequestedData, setHasRequestedData] = useState(false);
  
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  const [door, setDoor] = useState<string>('');

  const loadAddressData = async () => {
    if (hasRequestedData || loading || data.length > 0) return;

    setHasRequestedData(true);
    setLoading(true);
    try {
      const res = await fetch('/turkey-address.json');
      const json = await res.json() as AddressData[];
      setData(json);
    } catch (err) {
      console.warn('Failed to load address data', err);
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => data.map(d => d.name).sort(), [data]);
  
  const counties = useMemo(() => {
    if (!selectedCity) return [];
    const city = data.find(d => d.name === selectedCity);
    return city ? city.counties.map(c => c.name).sort() : [];
  }, [data, selectedCity]);

  const neighborhoods = useMemo(() => {
    if (!selectedCity || !selectedCounty) return [];
    const city = data.find(d => d.name === selectedCity);
    const county = city?.counties.find(c => c.name === selectedCounty);
    if (!county) return [];
    
    const allNeighborhoods: string[] = [];
    county.districts.forEach(d => {
      d.neighborhoods.forEach(n => {
        if (!allNeighborhoods.includes(n.name)) {
          allNeighborhoods.push(n.name);
        }
      });
    });
    return allNeighborhoods.sort();
  }, [data, selectedCity, selectedCounty]);

  useEffect(() => {
    const fullAddress = [
      selectedCity ? `${t('address_il')}: ${selectedCity}` : '',
      selectedCounty ? `${t('address_ilce')}: ${selectedCounty}` : '',
      selectedNeighborhood ? `${t('address_mahalle')}: ${selectedNeighborhood}` : '',
      street ? `${t('address_sokak')}: ${street}` : '',
      building ? `${t('address_no')}: ${building}` : '',
      door ? `${t('address_daire')}: ${door}` : ''
    ].filter(Boolean).join(' | ');
    
    onAddressChange(fullAddress, {
      city: selectedCity,
      county: selectedCounty,
      neighborhood: selectedNeighborhood,
      street,
      building,
      door
    });
  }, [selectedCity, selectedCounty, selectedNeighborhood, street, building, door]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2 bg-muted/5 rounded-lg border border-dashed border-muted-foreground/20">
        <Loader2 className="animate-spin text-primary/50 mr-2" size={12} />
        <span className="text-[10px] font-bold opacity-40">...</span>
      </div>
    );
  }

  const renderSelect = (id: string, label: string, value: string, items: string[], onChange: (val: string) => void, placeholder: string) => (
    <div className="space-y-0.5 flex-1">
      <label htmlFor={id} className="text-[9px] font-black uppercase tracking-[0.05em] text-foreground ml-0.5">{label}</label>
      <div className="relative group">
        <select
          id={id}
          value={value}
          onFocus={loadAddressData}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 text-[12px] font-bold focus:ring-1 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 text-foreground",
            isHeroMini ? "h-8" : "h-9"
          )}
        >
          <option value="" disabled className="bg-card text-foreground">{placeholder}</option>
          {items.map(item => (
            <option key={item} value={item} className="bg-card text-foreground">{item}</option>
          ))}
        </select>
        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none group-hover:text-primary transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="space-y-2" onPointerEnter={loadAddressData}>
      {/* Cascading Selects */}
      <div className="grid grid-cols-3 gap-1.5">
        {renderSelect(`${idPrefix}-city`, t('address_il'), selectedCity, cities, (val) => {
          setSelectedCity(val);
          setSelectedCounty('');
          setSelectedNeighborhood('');
        }, t('address_il'))}

        {renderSelect(`${idPrefix}-county`, t('address_ilce'), selectedCounty, counties, (val) => {
          setSelectedCounty(val);
          setSelectedNeighborhood('');
        }, t('address_ilce'))}

        {renderSelect(`${idPrefix}-neighborhood`, t('address_mahalle'), selectedNeighborhood, neighborhoods, (val) => {
          setSelectedNeighborhood(val);
        }, t('address_mahalle'))}
      </div>

      {/* Details Area */}
        {selectedNeighborhood && (
          <div
            className="grid grid-cols-3 gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="space-y-0.5">
              <label htmlFor={`${idPrefix}-street`} className="text-[9px] font-black uppercase tracking-[0.05em] text-muted-foreground/60 ml-0.5">{t('address_sokak')}</label>
              <input
                id={`${idPrefix}-street`}
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="..."
                className={cn(
                  "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 text-[12px] font-bold focus:ring-1 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-foreground",
                  isHeroMini ? "h-8" : "h-9"
                )}
              />
            </div>
            <div className="space-y-0.5">
              <label htmlFor={`${idPrefix}-building`} className="text-[9px] font-black uppercase tracking-[0.05em] text-muted-foreground/60 ml-0.5">{t('address_no')}</label>
              <input
                id={`${idPrefix}-building`}
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="..."
                className={cn(
                  "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 text-[12px] font-bold focus:ring-1 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-foreground",
                  isHeroMini ? "h-8" : "h-9"
                )}
              />
            </div>
            <div className="space-y-0.5">
              <label htmlFor={`${idPrefix}-door`} className="text-[9px] font-black uppercase tracking-[0.05em] text-muted-foreground/60 ml-0.5">{t('address_daire')}</label>
              <input
                id={`${idPrefix}-door`}
                type="text"
                value={door}
                onChange={(e) => setDoor(e.target.value)}
                placeholder="..."
                className={cn(
                  "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-2 text-[12px] font-bold focus:ring-1 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-foreground",
                  isHeroMini ? "h-8" : "h-9"
                )}
              />
            </div>
          </div>
        )}

      {/* Selected Address Preview */}
      {(selectedCity || selectedCounty || selectedNeighborhood) && (
        <div className="p-1.5 bg-primary/5 border border-primary/10 rounded-lg flex items-center gap-1.5">
          <MapPin size={10} className="text-primary shrink-0" />
          <p className="text-[9px] font-bold text-foreground/50 truncate">
            {selectedCity} {selectedCounty && `> ${selectedCounty}`} {selectedNeighborhood && `> ${selectedNeighborhood}`}
          </p>
        </div>
      )}
    </div>
  );
}
