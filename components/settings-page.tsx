'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, X, Save } from "lucide-react"

type RacePR = {
  id: number
  type: 'swim' | 'bike' | 'run'
  distance: string
  distanceUnit: 'miles' | 'kilometers' | 'meters'
  hours: string
  minutes: string
  seconds: string
  milliseconds: string
}

type CurrentRace = {
  id: number
  name: string
  date: string
  type: 'swim' | 'bike' | 'run' | 'triathlon'
  priority: 'A' | 'B' | 'C'
}

export function SettingsPageComponent() {
  const [maxHeartRate, setMaxHeartRate] = useState('')
  const [vo2Max, setVo2Max] = useState('')
  const [ftp, setFtp] = useState('')
  const [racePRs, setRacePRs] = useState<RacePR[]>([])
  const [currentRaces, setCurrentRaces] = useState<CurrentRace[]>([])

  const addRacePR = () => {
    setRacePRs([...racePRs, {
      id: Date.now(),
      type: 'run',
      distance: '',
      distanceUnit: 'kilometers',
      hours: '',
      minutes: '',
      seconds: '',
      milliseconds: ''
    }])
  }

  const updateRacePR = (id: number, field: keyof RacePR, value: string) => {
    setRacePRs(racePRs.map(pr => pr.id === id ? { ...pr, [field]: value } : pr))
  }

  const removeRacePR = (id: number) => {
    setRacePRs(racePRs.filter(pr => pr.id !== id))
  }

  const saveRacePR = (id: number) => {
    console.log('Saving Race PR:', racePRs.find(pr => pr.id === id))
    alert('Race PR saved!')
  }

  const addCurrentRace = () => {
    setCurrentRaces([...currentRaces, {
      id: Date.now(),
      name: '',
      date: '',
      type: 'run',
      priority: 'B'
    }])
  }

  const updateCurrentRace = (id: number, field: keyof CurrentRace, value: string) => {
    setCurrentRaces(currentRaces.map(race => race.id === id ? { ...race, [field]: value } : race))
  }

  const removeCurrentRace = (id: number) => {
    setCurrentRaces(currentRaces.filter(race => race.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ maxHeartRate, vo2Max, ftp, racePRs, currentRaces })
    alert('Settings saved!')
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Athlete Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs defaultValue="current-fitness" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current-fitness">Current Fitness</TabsTrigger>
            <TabsTrigger value="race-prs">Race PRs</TabsTrigger>
          </TabsList>
          <TabsContent value="current-fitness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Fitness Metrics</CardTitle>
                <CardDescription>Enter your current fitness data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxHeartRate">Max Heart Rate (bpm)</Label>
                    <Input
                      id="maxHeartRate"
                      type="number"
                      value={maxHeartRate}
                      onChange={(e) => setMaxHeartRate(e.target.value)}
                      placeholder="180"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vo2Max">VO2 Max (ml/kg/min)</Label>
                    <Input
                      id="vo2Max"
                      type="number"
                      value={vo2Max}
                      onChange={(e) => setVo2Max(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ftp">FTP (watts)</Label>
                    <Input
                      id="ftp"
                      type="number"
                      value={ftp}
                      onChange={(e) => setFtp(e.target.value)}
                      placeholder="250"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Current Races</CardTitle>
                <CardDescription>Add your upcoming races or key workouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentRaces.map((race) => (
                  <div key={race.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Race Name"
                        value={race.name}
                        onChange={(e) => updateCurrentRace(race.id, 'name', e.target.value)}
                        className="w-full max-w-xs"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCurrentRace(race.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="date"
                        value={race.date}
                        onChange={(e) => updateCurrentRace(race.id, 'date', e.target.value)}
                        className="w-full max-w-xs"
                      />
                      <Select value={race.type} onValueChange={(value) => updateCurrentRace(race.id, 'type', value as 'swim' | 'bike' | 'run' | 'triathlon')}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="swim">Swim</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                          <SelectItem value="run">Run</SelectItem>
                          <SelectItem value="triathlon">Triathlon</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={race.priority} onValueChange={(value) => updateCurrentRace(race.id, 'priority', value as 'A' | 'B' | 'C')}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A (High)</SelectItem>
                          <SelectItem value="B">B (Medium)</SelectItem>
                          <SelectItem value="C">C (Low)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addCurrentRace} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Current Race
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="race-prs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Race Personal Records</CardTitle>
                <CardDescription>Add your best times for various races</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {racePRs.map((pr) => (
                  <div key={pr.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Select value={pr.type} onValueChange={(value) => updateRacePR(pr.id, 'type', value as 'swim' | 'bike' | 'run')}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="swim">Swim</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                          <SelectItem value="run">Run</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRacePR(pr.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Distance"
                        type="number"
                        value={pr.distance}
                        onChange={(e) => updateRacePR(pr.id, 'distance', e.target.value)}
                        className="w-[120px]"
                      />
                      <Select 
                        value={pr.distanceUnit} 
                        onValueChange={(value) => updateRacePR(pr.id, 'distanceUnit', value as 'miles' | 'kilometers' | 'meters')}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="miles">Miles</SelectItem>
                          <SelectItem value="kilometers">Kilometers</SelectItem>
                          <SelectItem value="meters">Meters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="HH"
                        type="number"
                        min="0"
                        max="99"
                        value={pr.hours}
                        onChange={(e) => updateRacePR(pr.id, 'hours', e.target.value)}
                        className="w-[60px]"
                      />
                      <span>:</span>
                      <Input
                        placeholder="MM"
                        type="number"
                        min="0"
                        max="59"
                        value={pr.minutes}
                        onChange={(e) => updateRacePR(pr.id, 'minutes', e.target.value)}
                        className="w-[60px]"
                      />
                      <span>:</span>
                      <Input
                        placeholder="SS"
                        type="number"
                        min="0"
                        max="59"
                        value={pr.seconds}
                        onChange={(e) => updateRacePR(pr.id, 'seconds', e.target.value)}
                        className="w-[60px]"
                      />
                      <span>.</span>
                      <Input
                        placeholder="ms"
                        type="number"
                        min="0"
                        max="999"
                        value={pr.milliseconds}
                        onChange={(e) => updateRacePR(pr.id, 'milliseconds', e.target.value)}
                        className="w-[70px]"
                      />
                    </div>
                    <Button type="button" onClick={() => saveRacePR(pr.id)} className="w-full">
                      <Save className="mr-2 h-4 w-4" /> Save PR
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addRacePR} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Race PR
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Button type="submit" className="w-full">Save All Settings</Button>
      </form>
    </div>
  )
}