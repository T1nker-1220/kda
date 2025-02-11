import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestPage() {
  return (
    <main
      className="min-h-screen bg-brand-brown p-8"
      aria-label="Component Test Page"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-brand-orange text-center mb-8">
          Component Test Page
        </h1>

        {/* Card Component Test */}
        <Card className="bg-white/95 shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-brand-brown">Authentication Card</CardTitle>
            <CardDescription>Testing our styled components with accessibility in mind</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                Email
                <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">required</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="border-brand-brown focus:ring-brand-orange transition-all"
                aria-required="true"
                aria-describedby="email-hint"
              />
              <p id="email-hint" className="text-sm text-muted-foreground">
                We&apos;ll never share your email with anyone else.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1">
                Password
                <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">required</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="border-brand-brown focus:ring-brand-orange transition-all"
                aria-required="true"
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="text-sm text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="bg-brand-orange hover:bg-brand-orange/90 transition-colors focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
              aria-label="Submit authentication form"
            >
              Primary Action
            </Button>
            <Button
              variant="outline"
              className="border-brand-brown text-brand-brown hover:bg-brand-brown/10 transition-colors focus:ring-2 focus:ring-brand-brown focus:ring-offset-2"
              aria-label="Cancel authentication"
            >
              Secondary Action
            </Button>
          </CardFooter>
        </Card>

        {/* Button Variants */}
        <Card className="bg-white/95 shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-brand-brown">Button Variants</CardTitle>
            <CardDescription>Different button styles with hover and focus states</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              className="bg-brand-orange hover:bg-brand-orange/90 transition-colors focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
              aria-label="Primary button example"
            >
              Primary
            </Button>
            <Button
              variant="secondary"
              className="bg-brand-brown hover:bg-brand-brown/90 transition-colors focus:ring-2 focus:ring-brand-brown focus:ring-offset-2"
              aria-label="Secondary button example"
            >
              Secondary
            </Button>
            <Button
              variant="outline"
              className="border-brand-orange text-brand-orange hover:bg-brand-orange/10 transition-colors focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
              aria-label="Outline button example"
            >
              Outline
            </Button>
            <Button
              variant="ghost"
              className="text-brand-brown hover:bg-brand-brown/10 transition-colors focus:ring-2 focus:ring-brand-brown focus:ring-offset-2"
              aria-label="Ghost button example"
            >
              Ghost
            </Button>
          </CardContent>
        </Card>

        {/* Input Variants */}
        <Card className="bg-white/95 shadow-lg transition-all hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-brand-brown">Input Variants</CardTitle>
            <CardDescription>Different input states and variations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-input">Default Input</Label>
              <Input
                id="default-input"
                placeholder="Default input"
                className="border-brand-brown focus:ring-brand-orange transition-all hover:border-brand-orange/50"
                aria-label="Default input example"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input
                id="disabled-input"
                disabled
                placeholder="Disabled input"
                aria-label="Disabled input example"
                aria-disabled="true"
              />
              <p className="text-sm text-muted-foreground">This input is currently disabled</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-input">With Icon</Label>
              <div className="relative">
                <Input
                  id="search-input"
                  placeholder="Search..."
                  className="pl-8 border-brand-brown focus:ring-brand-orange transition-all hover:border-brand-orange/50"
                  aria-label="Search input with icon"
                />
                <span
                  className="absolute left-2 top-2.5 text-gray-400"
                  aria-hidden="true"
                >
                  🔍
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Click to start searching</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
