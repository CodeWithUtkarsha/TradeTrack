import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickTradeSchema, type QuickTradeRequest } from "@shared/schema";
import { tradeService } from "@/lib/tradeService";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateForexPnL, 
  isForexPair, 
  getSupportedPairs, 
  LOT_SIZES,
  formatCurrency,
  formatPips
} from "@/lib/forexCalculations";
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
import { Plus, Calculator } from "lucide-react";

interface TradeModalProps {
  children?: React.ReactNode;
}

export default function TradeModal({ children }: TradeModalProps) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState([3]);
  const [pnlPreview, setPnlPreview] = useState<{pnl: number; pips: number} | null>(null);
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
      lotType: "micro",
      stopLoss: "",
      takeProfit: "",
      mood: 3,
      notes: "",
      tags: [],
    },
  });

  // Watch form values for real-time calculation
  const watchedValues = form.watch();

  // Calculate PnL preview when exit price is provided
  const calculatePnLPreview = () => {
    const { symbol, type, entryPrice, exitPrice, quantity, lotType } = watchedValues;
    
    if (symbol && entryPrice && exitPrice && quantity && isForexPair(symbol)) {
      try {
        const result = calculateForexPnL({
          entryPrice: parseFloat(entryPrice),
          exitPrice: parseFloat(exitPrice),
          lotSize: parseFloat(quantity),
          lotType: lotType,
          symbol: symbol,
          type: type as 'Long' | 'Short',
        });
        setPnlPreview({ pnl: result.pnl, pips: result.pips });
      } catch (error) {
        setPnlPreview(null);
      }
    } else {
      setPnlPreview(null);
    }
  };

  // Update preview when relevant fields change
  React.useEffect(() => {
    calculatePnLPreview();
  }, [watchedValues.symbol, watchedValues.entryPrice, watchedValues.exitPrice, watchedValues.quantity, watchedValues.lotType, watchedValues.type]);

  const createTradeMutation = useMutation({
    mutationFn: async (data: QuickTradeRequest) => {
      console.log('🎯 TradeModal: Creating trade with data:', data);
      
      let calculatedPnL = 0;
      let calculatedPips = 0;
      let calculatedReturnPercent = 0;

      // Calculate PnL for completed trades using forex calculations
      if (data.exitPrice && isForexPair(data.symbol)) {
        try {
          const result = calculateForexPnL({
            entryPrice: parseFloat(data.entryPrice),
            exitPrice: parseFloat(data.exitPrice),
            lotSize: parseFloat(data.quantity),
            lotType: data.lotType,
            symbol: data.symbol,
            type: data.type as 'Long' | 'Short',
          });
          calculatedPnL = result.pnl;
          calculatedPips = result.pips;
          calculatedReturnPercent = result.returnPercent;
        } catch (error) {
          console.warn('Failed to calculate forex PnL:', error);
        }
      }
      
      const tradeData = {
        symbol: data.symbol,
        type: data.type,
        entryPrice: Math.abs(parseFloat(data.entryPrice)), // Ensure positive
        exitPrice: data.exitPrice ? Math.abs(parseFloat(data.exitPrice)) : undefined,
        quantity: Math.abs(parseFloat(data.quantity)), // Ensure positive
        lotType: data.lotType,
        stopLoss: data.stopLoss ? Math.abs(parseFloat(data.stopLoss)) : undefined,
        takeProfit: data.takeProfit ? Math.abs(parseFloat(data.takeProfit)) : undefined,
        pnl: data.exitPrice ? calculatedPnL : undefined,
        pips: data.exitPrice ? calculatedPips : undefined,
        returnPercent: data.exitPrice ? calculatedReturnPercent : undefined,
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-override" data-testid="select-symbol">
                          <SelectValue placeholder="Select pair" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-morphism border-gray-600">
                        {getSupportedPairs().map((pair) => (
                          <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Lot Size</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="1.0"
                        className="input-override"
                        data-testid="input-quantity"
                        onBlur={(e) => {
                          const value = Math.abs(parseFloat(e.target.value));
                          if (value && value > 0) {
                            field.onChange(value.toString());
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Lot Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-override" data-testid="select-lot-type">
                          <SelectValue placeholder="Select lot type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-morphism border-gray-600">
                        {Object.entries(LOT_SIZES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.name}</SelectItem>
                        ))}
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
                        step="0.00001"
                        min="0.00001"
                        placeholder="1.09000"
                        className="input-override"
                        data-testid="input-entry-price"
                        onBlur={(e) => {
                          const value = Math.abs(parseFloat(e.target.value));
                          if (value && value > 0) {
                            field.onChange(value.toString());
                          }
                        }}
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
                    <FormLabel className="text-gray-300">Exit Price (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.00001"
                        min="0.00001"
                        placeholder="1.09500"
                        className="input-override"
                        data-testid="input-exit-price"
                        onBlur={(e) => {
                          const value = Math.abs(parseFloat(e.target.value));
                          if (value && value > 0) {
                            field.onChange(value.toString());
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Stop Loss (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.00001"
                        placeholder="1.08500"
                        className="input-override"
                        data-testid="input-stop-loss"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="takeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Take Profit (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.00001"
                        placeholder="1.10500"
                        className="input-override"
                        data-testid="input-take-profit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PnL Preview */}
            {pnlPreview && (
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-gray-300">Trade Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">P&L:</span>
                    <span className={`ml-2 font-medium ${pnlPreview.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(pnlPreview.pnl)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Pips:</span>
                    <span className={`ml-2 font-medium ${pnlPreview.pips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPips(pnlPreview.pips)}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
