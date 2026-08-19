const fs = require('fs');

const file = 'f:/Dss-Project/moncradle/frontend/parent-pwa/src/app/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file got mangled around line 100
// I will replace everything from `<Image src={user?.avatar || "/images/splashscreen2.png"}` 
// to `setEditingAddress(null);`

const startMatch = '<Image src={user?.avatar || "/images/splashscreen2.png"} alt="Profile" width={64} height={64} className="object-cover w-full h-full" />';
const endMatch = 'setEditingAddress(null);';

const startIndex = content.indexOf(startMatch);
const endIndex = content.indexOf(endMatch);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `${startMatch}
                 </div>
                 <div>
                   <h2 className="text-lg font-semibold text-gray-900 pr-8">{user?.name || "Parent Name"}</h2>
                   <p className="text-xs text-gray-500 font-medium">{user?.email || "No email provided"}</p>
                   <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded border border-purple-100">Parent Account</span>
                 </div>
               </div>
               
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-800">{user?.phone ? \`+91 \${user.phone}\` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Member Since</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.createdAt ? new Date(user.createdAt as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "2024"}
                    </p>
                  </div>
                </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                   <h3 className="text-sm font-semibold text-gray-900">Delivery Addresses</h3>
                 </div>
                 <button onClick={() => {
                   ${endMatch}`;
  
  content = content.slice(0, startIndex) + newContent + content.slice(endIndex + endMatch.length);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Repaired file successfully!");
} else {
  console.log("Could not find start or end matches");
}
