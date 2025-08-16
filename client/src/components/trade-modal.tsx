import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickTradeSchema, type QuickTradeRequest } from "@shared/schema";
import { tradeService } from "@/lib/tradeService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TradeModalProps {
  children?: React.ReactNode;
}

export default function TradeModal({ children }: TradeModalProps) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState([3]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuickTradeRequest>({
    resolver: zodResolver(quickTradeSchema),
    defaultValues: {
      symbol: "",
      type: "Long",
      entryPrice: "",
      exitPrice: "",
      quantity: "",
      mood: 3,
      notes: "",
      tags: [],
    },
  });

  const createTradeMutation = useMutation({
    mutationFn: async (data: QuickTradeRequest) => {
      console.log('🎯 TradeModal: Creating trade with data:', data);
      
      const tradeData = {
        symbol: data.symbol,
        type: data.type,
        entryPrice: parseFloat(data.entryPrice),
        exitPrice: data.exitPrice ? parseFloat(data.exitPrice) : undefined,
        quantity: parseInt(data.quantity),
        mood: data.mood,
        tags: data.tags,
        notes: data.notes,
        entryTime: new Date(),
        screenshots: [],
        strategy: undefined,
        marketCondition: undefined,
        sessionType: undefined,
      };
      
      console.log('🎯 TradeModal: Sending to backend:', tradeData);
      const result = await tradeService.createTrade(tradeData);
      console.log('✅ TradeModal: Trade created successfully:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Trade logged successfully",
        description: "Your trade has been added to your journal.",
      });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      setOpen(false);
      form.reset();
      setMood([3]);
    },
    onError: (error: any) => {
      console.error('❌ TradeModal: Trade creation failed:', error);
      toast({
        title: "Failed to log trade",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuickTradeRequest) => {
    const submitData = { ...data, mood: mood[0] };
    createTradeMutation.mutate(submitData);
  };

  const moodLabels = ["😡 Panicked", "😟 Worried", "😐 Neutral", "😊 Confident", "😌 Euphoric"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="btn-primary animate-glow" data-testid="button-quick-trade">
            <Plus className="w-4 h-4 mr-2" />
            Quick Log Trade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-morphism border-gray-600 max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text text-2xl">Quick Log Trade</DialogTitle>
          <DialogDescription className="text-gray-300">
            Log your trade details quickly and efficiently
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Symbol</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="TSLA"
                        className="input-override"
                        data-testid="input-symbol"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-override" data-testid="select-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-morphism border-gray-600">
                        <SelectItem value="Long">Long</SelectItem>
                        <SelectItem value="Short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Entry Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="250.00"
                        className="input-override"
                        data-testid="input-entry-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Exit Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="255.00"
                        className="input-override"
                        data-testid="input-exit-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Quantity</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="100"
                      className="input-override"
                      data-testid="input-quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-gray-300 block mb-2">
                Emotion (1-5): {moodLabels[mood[0] - 1]}
              </FormLabel>
              <Slider
                value={mood}
                onValueChange={setMood}
                max={5}
                min={1}
                step={1}
                className="w-full"
                data-testid="slider-mood"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>😡 Panicked</span>
                <span>😌 Confident</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Trade notes and observations..."
                      rows={3}
                      className="input-override"
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={createTradeMutation.isPending}
              data-testid="button-submit-trade"
            >
              {createTradeMutation.isPending ? "Logging Trade..." : "Log Trade"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
