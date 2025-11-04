"""
Batch Data Enrichment with Resume Capability - FIXED VERSION
For large datasets or handling failures
"""

import csv
import json
import os
import sys
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_enrichment_agent_final import DataEnrichmentAgent

class BatchEnrichmentProcessor:
    def __init__(self):
        self.agent = DataEnrichmentAgent()
        self.progress_file = 'enrichment_progress.json'
        self.failed_file = 'enrichment_failed.csv'
        self.progress = {
            'completed': [],
            'failed': [],
            'last_index': -1,
            'timestamp': None
        }
    
    def load_progress(self):
        """Load previous progress if exists"""
        if os.path.exists(self.progress_file):
            with open(self.progress_file, 'r') as f:
                self.progress = json.load(f)
            print(f"📂 Loaded progress: {len(self.progress['completed'])} completed, {len(self.progress['failed'])} failed")
            return True
        return False
    
    def save_progress(self):
        """Save current progress"""
        self.progress['timestamp'] = datetime.now().isoformat()
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def save_failed_items(self, software_list):
        """Save failed items to CSV for retry"""
        if not self.progress['failed']:
            return
        
        failed_names = set(self.progress['failed'])
        failed_items = [s for s in software_list if s['software_name'] in failed_names]
        
        if failed_items:
            with open(self.failed_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=['software_name', 'description'])
                writer.writeheader()
                writer.writerows(failed_items)
            
            print(f"\n💾 Saved {len(failed_items)} failed items to: {self.failed_file}")
    
    def process_with_resume(self, csv_file_path: str):
        """Process CSV with resume capability"""
        print("\n" + "="*60)
        print("🚀 BATCH ENRICHMENT WITH RESUME")
        print("="*60)
        
        # Load software list
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            software_list = list(reader)
        
        total_count = len(software_list)
        print(f"📂 Total software in CSV: {total_count}")
        
        # Load previous progress
        resume = self.load_progress()
        
        if resume:
            response = input("\n❓ Found previous progress. Resume? (y/n): ")
            if response.lower() != 'y':
                print("Starting fresh...")
                self.progress = {
                    'completed': [],
                    'failed': [],
                    'last_index': -1,
                    'timestamp': None
                }
                resume = False
        
        # Initialize agent
        self.agent.initialize_company()
        self.agent.load_feature_categories()
        
        # Filter items to process
        completed_set = set(self.progress['completed'])
        failed_set = set(self.progress['failed'])
        
        items_to_process = []
        for idx, item in enumerate(software_list):
            name = item['software_name']
            
            if resume and name in completed_set:
                continue  # Skip already completed
            
            if resume and name in failed_set:
                print(f"⏭️  Skipping previously failed: {name}")
                continue  # Skip previously failed (unless retrying)
            
            items_to_process.append((idx, item))
        
        print(f"\n📊 Processing {len(items_to_process)} items")
        print(f"   Already completed: {len(completed_set)}")
        print(f"   Previously failed: {len(failed_set)}")
        print(f"   To process: {len(items_to_process)}")
        
        if not items_to_process:
            print("\n✅ Nothing to process. All items already completed!")
            return
        
        # Process items
        for count, (idx, item) in enumerate(items_to_process, 1):
            name = item['software_name']
            description = item['description']
            
            print(f"\n{'='*60}")
            print(f"Processing {count}/{len(items_to_process)} (#{idx+1} in CSV): {name}")
            print(f"{'='*60}")
            
            try:
                # Enrich
                enriched_data = self.agent.enrich_software_data(name, description)
                
                if enriched_data:
                    # Save
                    success = self.agent.save_to_database(name, description, enriched_data)
                    
                    if success:
                        self.progress['completed'].append(name)
                        self.progress['last_index'] = idx
                        print(f"✅ Success: {name}")
                    else:
                        self.progress['failed'].append(name)
                        print(f"❌ Failed to save: {name}")
                else:
                    self.progress['failed'].append(name)
                    print(f"❌ Failed to enrich: {name}")
            
            except KeyboardInterrupt:
                print("\n\n⚠️  Interrupted by user!")
                self.save_progress()
                self.save_failed_items(software_list)
                print("\n💾 Progress saved. Run again to resume.")
                sys.exit(0)
            
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                self.progress['failed'].append(name)
            
            # Save progress after each item
            self.save_progress()
            
            # Rate limiting
            if count % 5 == 0:
                print(f"\n⏸️  Batch checkpoint. Progress saved.")
                import time
                time.sleep(5)
            else:
                import time
                time.sleep(1)
        
        # Save failed items
        self.save_failed_items(software_list)
        
        # Final summary
        print("\n" + "="*60)
        print("🎉 BATCH PROCESSING COMPLETE")
        print("="*60)
        print(f"✅ Successfully enriched: {len(self.progress['completed'])}")
        print(f"❌ Failed: {len(self.progress['failed'])}")
        print(f"📊 Success rate: {(len(self.progress['completed']) / total_count * 100):.1f}%")
        
        if self.progress['failed']:
            print(f"\n💡 To retry failed items:")
            print(f"   python3 batch_enrichment_fixed.py --retry")
        
        print("="*60 + "\n")
    
    def retry_failed(self):
        """Retry previously failed items"""
        if not os.path.exists(self.failed_file):
            print("❌ No failed items file found")
            return
        
        print("\n🔄 RETRYING FAILED ITEMS")
        
        # Clear failed list for retry
        self.progress['failed'] = []
        self.save_progress()
        
        # Process failed file
        self.process_with_resume(self.failed_file)


def main():
    processor = BatchEnrichmentProcessor()
    
    # Check for retry flag
    if len(sys.argv) > 1 and sys.argv[1] == '--retry':
        processor.retry_failed()
    else:
        csv_file = 'biorad_software_final_processed.csv'
        
        if not os.path.exists(csv_file):
            print(f"❌ Error: File not found: {csv_file}")
            print(f"\nLooking for the FINAL processed BioRad data file (95 unique products).")
            print(f"Make sure biorad_software_final_processed.csv is in the current directory.")
            sys.exit(1)
        
        processor.process_with_resume(csv_file)


if __name__ == "__main__":
    main()
